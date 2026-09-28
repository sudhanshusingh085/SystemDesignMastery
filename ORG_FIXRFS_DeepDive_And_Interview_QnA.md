# ORG FIXRFS & Java Bridge Architecture Deep-Dive
### Technical Mechanics, FIX Protocol Internals & Expected Interview Questions

---

## 📌 1. Architectural Deep-Dive: FIXRFS & Java Bridge

```
 +--------------------------------------------------------------------------------------------------+
 |                                    ORG.SERVICES.FIXRFS (.NET)                                  |
 |                                                                                                  |
 |  [ 1. Business Ingestion ]                                                                       |
 |    - REST API / Queue listener receives PriceProviderRequest from FXCCore                        |
 |    - DBFXRFS fetches pending RFQ params (usp_Get_FX_Pending_Price_RFQ_Details)                    |
 |                                                                                                  |
 |  [ 2. FIX Message Generator (DBConfigFixMsgGen / ConfigurableFIXHandler) ]                       |
 |    - Maps DTO -> FIX 4.2/4.4/5.0 Tag-Value Strings                                               |
 |    - QuoteRequest (35=R), NewOrderSingle (35=D), OrderCancel (35=F)                              |
 |                                                                                                  |
 |  [ 3. QuickFix/n Engine (ClientInitiator : IApplication) ]                                       |
 |    - Callbacks: OnCreate, OnLogon, OnLogout, ToAdmin, FromAdmin, ToApp, FromApp                  |
 |    - Session Management: SenderCompID, TargetCompID, MsgSeqNum, Heartbeats                       |
 |    - Storage: FileStoreFactory (persistence) & FileLogFactory (audit trail)                      |
 |                                                                                                  |
 |  [ 4. Multithreaded Processing (QueueMultithreading) ]                                           |
 |    - Worker threads decouple socket parsing from DB persistence & SignalR dispatch               |
 +--------------------------------------------------------------------------------------------------+
                                                |
                                     TCP Sockets (Raw FIX Stream)
                                                |
                                                v
 +--------------------------------------------------------------------------------------------------+
 |                                  JAVA FIX BRIDGE / ADAPTOR LAYER                                 |
 |                                                                                                  |
 |  [ 1. High-Throughput NIO Socket Multiplexer (Netty / Java NIO) ]                                |
 |    - Aggregates multi-session connections across hundreds of Liquidity Providers (LPs)           |
 |                                                                                                  |
 |  [ 2. Multi-Protocol & Vendor Adaptors ]                                                         |
 |    - Proprietary Vendor Protocols: Bloomberg FXGO, Refinitiv 360T, Currenex, FastMatch           |
 |    - Direct Bank Binary / FIX Adaptors (Citi, Barclays, Deutsche Bank, UBS)                     |
 |                                                                                                  |
 |  [ 3. Normalization & Smart Order Routing (SOR) ]                                                |
 |    - Normalizes diverse vendor tags into standard FIX responses (Quote 35=S, ExecReport 35=8)   |
 +--------------------------------------------------------------------------------------------------+
                                                |
                                       External VPN / Leased Line
                                                |
                                                v
                    [ Counterparties / Liquidity Providers (LPs) ]
```

---

## ⚙️ 2. Part 1: How FIXRFS Converts Business Requests into FIX Messages

### A. The Structure of a Financial FIX Message
Every FIX message is an ASCII string of `Tag=Value` pairs separated by the `SOH` (`\x01` or standard delimiter):
$$\text{Header} \implies \text{Body} \implies \text{Trailer}$$

```
8=FIX.4.4 | 9=142 | 35=R | 49=ORG_HDFC | 56=BARCLAYS | 34=105 | 52=20260926-06:00:00 | 117=RFQ_98765 | 55=USD/INR | 38=1000000 | 64=20260928 | 10=210
```

| Tag Number | Field Name | Meaning in our Project |
| :--- | :--- | :--- |
| **8** | `BeginString` | FIX protocol version (e.g., `FIX.4.4`). |
| **9** | `BodyLength` | Character length of the message body. |
| **35** | `MsgType` | **`35=R`** (Quote Request), **`35=S`** (Quote), **`35=D`** (New Order), **`35=8`** (Execution Report). |
| **49** | `SenderCompID` | ORG Gateway identifier (e.g., `ORG_HDFC`). |
| **56** | `TargetCompID` | Counterparty / Java Bridge identifier (e.g., `BARCLAYS_FIX`, `BLOOMBERG_FX`). |
| **34** | `MsgSeqNum` | Monotonically increasing sequence number (e.g., `105`). |
| **52** | `SendingTime` | UTC timestamp of transmission (`YYYYMMDD-HH:MM:SS.sss`). |
| **117** | `QuoteReqID` | Unique tracking ID of the RFQ generated by ORG. |
| **55** | `Symbol` | Currency Pair (e.g., `USD/INR`, `EUR/USD`). |
| **38** | `OrderQty` | Deal Amount (e.g., `1000000`). |
| **64** | `SettlDate` | Value Date / Settlement Date (`2026-09-28`). |
| **10** | `CheckSum` | 3-digit modulo 256 checksum verifying transmission integrity. |

---

### B. Message Mapping in Code (`DBConfigFixMsgGen.cs` & `ConfigurableFIXHandler.cs`)
1. **Quote Request (`35=R`)**:
   ```csharp
   QuickFix.FIX44.QuoteRequest quoteReq = new QuickFix.FIX44.QuoteRequest(
       new QuoteReqID(request.RFQ_ID.ToString())
   );
   quoteReq.Set(new Symbol(request.CurrencyPair));     // Tag 55: USD/INR
   quoteReq.Set(new OrderQty(request.Amount));         // Tag 38: 1000000
   quoteReq.Set(new SettlDate(request.SettlementDate));// Tag 64: 2026-09-28
   Session.SendToTarget(quoteReq, sessionID);
   ```

2. **Order Execution / Deal Booking (`35=D` - NewOrderSingle)**:
   ```csharp
   QuickFix.FIX44.NewOrderSingle order = new QuickFix.FIX44.NewOrderSingle(
       new ClOrdID(deal.ClientOrderID),
       new Symbol(deal.CurrencyPair),
       new Side(deal.Direction == "BUY" ? Side.BUY : Side.SELL),
       new TransactTime(DateTime.UtcNow),
       new OrdType(OrdType.PREVIOUSLY_QUOTED)
   );
   order.Set(new Price(deal.AgreedRate));              // Tag 44: Agreed Quote Price
   order.Set(new QuoteID(deal.QuoteID));               // Tag 117: Reference Quote ID
   Session.SendToTarget(order, sessionID);
   ```

---

## 🔌 3. Part 2: How QuickFix/n Manages Sessions (`ClientInitiator.cs`)

`ClientInitiator.cs` implements the `QuickFix.IApplication` interface with 7 core callbacks:

```
                  +----------------------------------------------+
                  |         QuickFix.IApplication Lifecycle      |
                  +----------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
     [ Admin Messages ]                          [ Application Messages ]
  - ToAdmin (Logon, Heartbeats)               - ToApp (QuoteRequest, NewOrderSingle)
  - FromAdmin (ResendReq, Session rejects)    - FromApp (Quote, ExecutionReport)
            |                                           |
            v                                           v
  Session State: OnLogon / OnLogout         QueueMultithreading.cs -> DB / SignalR
```

### The 7 Core QuickFix Callbacks:
1. **`OnCreate(SessionID sessionID)`**: Fired when a configured session is loaded into memory.
2. **`OnLogon(SessionID sessionID)`**: Fired when handshake succeeds (`35=A` accepted). Updates database status to `"UP"` (`DB_Update_Internal_FIX_Session_SeesionID_And_Status`).
3. **`OnLogout(SessionID sessionID)`**: Fired when disconnected. Updates database status to `"DOWN"`.
4. **`ToAdmin(Message msg, SessionID)`**: Outgoing administrative messages. Injects encrypted credentials (`FIXLPLOGONPWD`, `FIXLPUSERNAME`) into the Logon (`35=A`) message.
5. **`FromAdmin(Message msg, SessionID)`**: Incoming administrative messages (`Heartbeat 35=0`, `TestRequest 35=1`, `ResendRequest 35=2`, `Reject 35=3`).
6. **`ToApp(Message msg, SessionID)`**: Outgoing business messages (`QuoteRequest 35=R`, `NewOrderSingle 35=D`).
7. **`FromApp(Message msg, SessionID)`**: Incoming business responses (`Quote 35=S`, `ExecutionReport 35=8`). Pushes messages into the thread-safe worker queue (`QueueMultithreading.cs`).

---

## ☕ 4. Part 3: Why Java Bridge & How It Communicates with .NET

### Why use a Java Bridge instead of connecting .NET directly to all LPs?
1. **Vendor Adaptor Compatibility**: Many multi-dealer trading venues (e.g. Bloomberg FXGO, Refinitiv 360T, Currenex, FastMatch) provide native Java SDKs and C/C++ libraries that are optimized for Linux trading engines.
2. **Ultra-Low Latency & High-Frequency Streaming**: Java NIO (Netty) can maintain hundreds of concurrent TCP sockets streaming market data feeds without GC hiccups or socket pool exhaustion.
3. **Smart Order Routing (SOR)**: The Java layer aggregates prices across multiple banks (Citi, Barclays, DB) and selects the best bid/offer (BBO) before routing the trade.

### How .NET and Java Communicate:
* **Protocol**: Persistent TCP/IP Socket running standard FIX protocol (or high-speed ZeroMQ/Kafka messaging).
* **Role**: `FIXRFS` acts as the **FIX Initiator** (Client) connecting to the Java Bridge acting as the **FIX Acceptor** (Server).

---

## ❓ 5. High-Probability Interview Questions & Answers on this Layer

Here are the specific, tricky questions interviewers will ask about FIX and Socket Engines:

---

### Q1: "What happens if message sequence numbers (`MsgSeqNum Tag 34`) get out of sync?"
> **Answer:**
> "FIX uses monotonically increasing sequence numbers (`Tag 34`) on both sides of the session.
> * **If the Gateway receives a sequence number higher than expected** (e.g., expects `105` but gets `108`), it detects a **Sequence Gap**.
> * QuickFix automatically issues a **`ResendRequest` (Tag `35=2`)** specifying `BeginSeqNo=105` and `EndSeqNo=0` (requesting all missing messages).
> * The counterparty resends the missing messages with `PossDupFlag (Tag 43) = Y` (Possible Duplicate).
> * If the counterparty sends a lower sequence number, QuickFix rejects the message and terminates the session with a `Logout (35=5)` to prevent replay attacks."

---

### Q2: "How do Heartbeats (`35=0`) and `TestRequest (35=1)` work in FIX?"
> **Answer:**
> "To verify that the TCP socket is alive during quiet trading periods:
> 1. Both sides agree on a `HeartBtInt` (e.g., 30 seconds).
> 2. If no business messages are sent within 30 seconds, QuickFix automatically transmits a **`Heartbeat` (Tag `35=0`)**.
> 3. If a party does not receive any message for `HeartBtInt + 20%` (e.g., 36 seconds), it transmits a **`TestRequest` (Tag `35=1`)** containing a unique `TestReqID (Tag 112)`.
> 4. The other party must reply immediately with a Heartbeat containing that same `TestReqID`. If no response arrives, QuickFix closes the socket and triggers reconnection logic."

---

### Q3: "What is the difference between a `Reject (35=3)` and a `BusinessMessageReject (35=j)`?"
> **Answer:**
> * **`Reject (35=3)` (Session Level)**: Message fails at the protocol level (e.g., missing required tag, invalid tag value, checksum failure, garbled message).
> * **`BusinessMessageReject (35=j)` (Application Level)**: Message structure is valid FIX, but business processing failed (e.g., Currency pair not tradable, LP pricing engine unavailable, unknown `QuoteReqID`)."

---

### Q4: "How does `FIXRFS` handle high-throughput incoming quotes without blocking the socket receiver thread?"
> **Answer:**
> "In `ClientInitiator.cs` and `QueueMultithreading.cs`, we use the **Producer-Consumer Pattern**:
> 1. QuickFix's `FromApp` callback acts as the Producer: it quickly grabs the incoming `Quote (35=S)` message and enqueues it into a thread-safe `ConcurrentQueue` without performing blocking operations.
> 2. Background worker threads (Consumers) dequeue the message, parse the fields using `ExecutionReportParser.cs`, update the SQL database, and push the live quote to the Angular UI via SignalR.
> This ensures the socket receiving thread is never blocked, preventing TCP buffer overflow and high latency."

---

### Q5: "What is the difference between `FileStoreFactory` and `MemoryStoreFactory` in QuickFix?"
> **Answer:**
> * **`FileStoreFactory` (Used in our project)**: Persists session state and sequence numbers to disk files. If the service restarts, it reads the last sequence number and state from disk, allowing graceful session recovery without resetting sequence numbers with the counterparty.
> * **`MemoryStoreFactory`**: Keeps sequence numbers in RAM. If the application crashes, all sequence history is lost, requiring a manual sequence reset (`ResetOnLogon=Y`)."

---

### Q6: "How do you handle Quote Expiration / Stale Quotes (Tag `62=ValidUntilTime`)?"
> **Answer:**
> "When an LP returns a Quote (`35=S`), it attaches **Tag 62 (`ValidUntilTime`)** or a quote validity duration (e.g., 5 seconds).
> * The Angular UI displays a countdown timer.
> * If the user clicks 'Book Deal' after the timer expires, `FXCCore` rejects the trade before calling `FIXRFS` with status `QuoteExpired`, preventing financial slippage and off-market trade execution."

---

## 📋 6. FIX Tags Cheat Sheet for Quick Reference

```
+-----------------------------------------------------------------------------------------------+
|                                      FIX PROTOCOL CHEAT SHEET                                 |
+---------+--------------------+----------------------------------------------------------------+
| Tag     | Name               | Meaning / Purpose                                              |
+---------+--------------------+----------------------------------------------------------------+
| 35      | MsgType            | R = QuoteRequest, S = Quote, D = NewOrder, 8 = ExecReport      |
| 49      | SenderCompID       | Identifier of sender (e.g. ORG_HDFC)                         |
| 56      | TargetCompID       | Identifier of target receiver (e.g. BARCLAYS, JAVA_GATEWAY)   |
| 34      | MsgSeqNum          | Sequential message number                                      |
| 117     | QuoteReqID         | Unique RFQ Identifier                                          |
| 55      | Symbol             | Currency Pair (USD/INR, EUR/USD)                               |
| 38      | OrderQty           | Deal Amount                                                    |
| 64      | SettlDate          | Settlement Date (YYYY-MM-DD)                                   |
| 188     | BidSpotRate        | Buy Price quoted by LP                                         |
| 190     | OfferSpotRate      | Sell Price quoted by LP                                        |
| 62      | ValidUntilTime     | Expiration timestamp of quote                                  |
| 39      | OrdStatus          | 0 = New, 1 = Partially Filled, 2 = Filled, 8 = Rejected        |
| 17      | ExecID             | Deal Execution Reference Number                                |
| 10      | CheckSum           | 3-digit ASCII checksum modulo 256                              |
+---------+--------------------+----------------------------------------------------------------+
```
