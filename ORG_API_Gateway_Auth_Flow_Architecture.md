# <ORG> API Gateway: Authentication & Authorization Flow
### Simple, Practical & Step-by-Step Guide (Full Stack Developer Interview Level)

---

## 📌 1. The Simple 1-Minute Story (What Happens in Our Project)

Here is the exact flow in plain English:

```
[ Angular Web App ]
       |
       | 1. User submits Username & Password
       v
[ API Gateway ]  ===========================>  [ LSS Identity Service ]
                 2. <ORG>InternalLogon()        3. Checks Database & Returns:
                 <===========================      - UserInfo (UserID, Role, EntityID)
       |                                           - SessionToken (GUID from DB)
       |
      | 4. Saves SessionToken in CacheStore (Redis: "LSSSessionToken_UserID")
      | 5. Generates JWT Token (signed with RSA Private Key) + Sets Cookies
      v
[ Angular App ]  <-- Receives JWT Token + Cookies (XSRF-TOKEN, .<ORG>.Auth)
      |
      | 6. Sends API Call: (Bearer JWT + AES-GCM Encrypted Body + x-fnq-req Hash)
      v
[ API Gateway (GatewayControllerV2) ]
       |
      | a. Validates JWT Signature using RSA Public Key
      | b. Checks CacheStore: Is SessionToken still valid in Redis? (Concurrent/Timeout Check)
      | c. Decrypts Request Body using AES-GCM (Session Key)
      | d. Verifies HMAC Hash (x-fnq-req) to ensure no tampering
      | e. Extracts UserID/EntityID from JWT and injects into downstream headers
       v
[ Core Microservices (Trade / Orders / Common / LSS) ]
       |
      | 7. Executes business logic (SQL/Trade) without needing to decrypt JWT
       v
[ API Gateway ]  --> Encrypts Response Body + Adds Hash (x-fnq-rep)
       v
[ Angular Web App ]  --> Receives response and displays on screen
```

---

## 🚀 2. Phase 1: The Login Flow (Step-by-Step)

When a user logs in from the Angular application:

### Step 1: Angular sends Login Request
* User enters `Username` and `Password` on the Angular login page.
* Angular sends a `POST` request to the API Gateway (`/Account/Login` or `/oauth/token`).

### Step 2: Gateway forwards to LSS (Login & Security Service)
* The Gateway's `AccountController` / `AuthorizationController` receives the request.
* It calls the backend **LSS Service** via `LssAdministration.<ORG>InternalLogon()`:
  * Sends: `Username`, `Password`, `DeviceID`, `ClientMachineIP`.

### Step 3: LSS Verifies Credentials
* **LSS checks**:
  * Is the username and password matching the database?
  * Is the user active or dormant?
  * Is the password expired?
  * Have max login retry attempts been exceeded?
* **LSS returns**:
  * Status: `LoginSucceeded` (HTTP 200)
  * `UserInfo`: `UserID`, `UserName`, `UserRole`, `GroupID`, `HomeEntityID`, `CSVOfMappedEntityIDs`.
  * `SessionToken`: A unique GUID session string generated for this login.

### Step 4: Gateway Saves Session in CacheStore
* The Gateway calls `LSSSessionTokenCacheStore.AddStoreLoginSessionToken()`:
  * It writes to the **CacheStore** (Redis / Distributed Memory Cache):
  * **Key**: `LSSSessionToken_{UserID}`
  * **Value**: `SessionToken`
  * **TTL (Expiry)**: Dynamic Idle Session Timeout (e.g., 15 or 30 minutes).
* *Why?* If the user logs in from a second device, or if an admin terminates the session, the gateway will detect it immediately from this cache.

### Step 5: Gateway Issues JWT Token with Asymmetric RSA Key
* The Gateway uses **OpenIddict** and `ClaimsManager.cs`:
  * It embeds claims into the token: `UserID`, `UserName`, `session_token`, `HomeEntityID`, `UserRole`, `DeviceID`.
  * It signs and encrypts the JWT Token using **Asymmetric RSA X.509 Certificates** (`TokenSigningCert` and `TokenEncrytionCert`).
* The Gateway also sets:
  * Anti-CSRF Cookie: `XSRF-TOKEN`
  * Auth Cookie: `.<ORG>.Auth`

### Step 6: Token Returned to Angular
* Gateway returns HTTP 200 with the `access_token`, `id_token`, and `expires_in` to the Angular app.
* Angular stores the token in memory / sessionStorage for all future requests.

---

## 🔒 3. Phase 2: What Happens on Every API Request (The Reverse Proxy Flow)

When an authenticated user clicks any button in Angular (e.g., "View Portfolio" or "Book Trade"):

### Step 1: Angular makes the API Call
* **URL**: `/api/v2/trade/getportfolio`
* **Headers**:
  * `Authorization`: `Bearer <JWT_TOKEN>`
  * `x-fnq-req`: HMAC-SHA256 hash of the request (anti-tampering signature).
* **Body**: Encrypted using **AES-GCM 256-bit** symmetric encryption.

### Step 2: Gateway Intercepts in `GatewayControllerV2.cs`
Before forwarding the request to the backend microservice, the Gateway performs **5 safety checks**:

```
[ Incoming Request ]
        |
        v
 [ Check 1: JWT Token Valid? ]  ----(No)----> 401 Unauthorized (Expired or Bad Signature)
        | (Yes)
        v
 [ Check 2: CacheStore Session Valid? ]  ----(No)----> 401 Unauthorized (Session Expired or Logged in Elsewhere)
        | (Yes)
        v
 [ Check 3: Decrypt Body (AES-GCM) ]  ----(No)----> 401 Unauthorized (Tampered Payload / Bad Tag)
        | (Yes)
        v
 [ Check 4: Validate Hash (HMAC-SHA256) ]  ----(No)----> 401 Unauthorized (URL or Body was Modified)
        | (Yes)
        v
 [ Check 5: Resolve Microservice URL & Forward ]
```

#### Detailed Breakdown of the 5 Gateway Checks:

1. **JWT Signature & Expiry Check**:
   * ASP.NET Core `JwtAuthentication` validates the JWT using the **RSA Public Key Certificate**.
   * Checks `ValidateIssuer`, `ValidateAudience`, and `ValidateLifetime`.

2. **CacheStore Session Check (`isValidLoginSession`)**:
   * Gateway extracts `UserID` and `session_token` from the JWT claims.
   * Looks up CacheStore: `LSSSessionToken_{UserID}`.
   * If the cache is empty (expired) or has a different token (another device logged in), Gateway rejects with `401 Unauthorized`.

3. **AES-GCM Payload Decryption**:
   * Gateway dynamically derives an encryption key from the session:
     $$\text{Key} = \text{SessionToken} + \text{Reverse(SessionToken)}$$
   * Decrypts the request body and URL route parameters using `AesGcm.Decrypt()`.
   * If someone tampered with the ciphertext, the 16-byte authentication tag fails and throws an error.

4. **HMAC-SHA256 Anti-Tampering Check (`ValidateHash`)**:
   * Gateway generates an HMAC hash of: `RequestURL + PlaintextBody` with key `SessionToken + IDORKey`.
   * Compares it with the incoming `x-fnq-req` header. If they don't match, someone modified the data in transit $\rightarrow$ reject!

5. **Forwarding to Backend Microservice**:
   * Gateway looks up `apiendpoints.json` to find the internal microservice address (e.g., `trade` $\rightarrow$ `http://internal-trade-service/api/portfolio`).
   * Injects user headers (`UserID`, `HomeEntityID`, `DeviceID`, `ClientMachineIP`).
   * Sends HTTP request using `HttpClient.Send(..., cancellationToken)`.

### Step 3: Backend Returns Response to Gateway
* The Trade/Portfolio microservice processes the request and sends the response back to Gateway.

### Step 4: Gateway Encrypts Response and Returns to Angular
* Gateway creates a response HMAC hash (`x-fnq-rep`).
* Encrypts the response body using `AesGcm.Encrypt()`.
* Sends the encrypted response + hash header back to Angular.
* Angular decrypts the data and renders it on screen.

---

## 💬 4. How to Explain This in Your Interview (2-Year Full Stack Dev Level)

### If they ask: *"Explain the Authentication and Authorization flow in your project."*

> **Speak like this (Clear, Simple & Confident):**
> 
> "In our project, we use an **API Gateway built in ASP.NET Core** that acts as the entry door for our Angular frontend before talking to our backend microservices like LSS and Trade services.
> 
> **1. Login Flow:**
> * When the user logs in from Angular with their username and password, the request hits our Gateway's `AccountController`.
> * The Gateway forwards these credentials to our backend **LSS (Login and Security Service)**.
> * LSS checks the database, verifies the password, checks if the account is active, and returns the user profile with a unique `SessionToken`.
> * Our Gateway then stores this `SessionToken` into our **CacheStore** (Redis) with a key like `LSSSessionToken_UserID` and sets an idle session timeout.
> * Then, using **OpenIddict**, the Gateway generates a **JWT Access Token** signed and encrypted with our **Asymmetric RSA X.509 Certificates**. This token contains claims like `UserID`, `HomeEntityID`, `UserRole`, and `session_token`.
> * The token is sent back to Angular.
> 
> **2. Subsequent API Requests:**
> * For every business request, Angular sends the Bearer JWT token in the header and encrypts the request payload using **AES-GCM**.
> * In the Gateway (`GatewayControllerV2`), before forwarding the request to the microservice, it performs a few checks:
>   1. **Validates JWT**: Checks the token signature using the RSA Public Key and verifies expiry.
>   2. **CacheStore Session Check**: Checks if the `session_token` inside the JWT still matches the active session in CacheStore (this handles logout, session timeout, and prevents concurrent logins).
>   3. **Decryption & Tamper Check**: Decrypts the payload using the session key and verifies the `x-fnq-req` HMAC hash to ensure the payload was not modified.
>   4. **Route & Forward**: Resolves the internal microservice endpoint from `apiendpoints.json`, injects user claims into headers, and forwards the call.
> * When the backend returns data, the Gateway encrypts the response body, adds the `x-fnq-rep` hash header, and returns it to Angular."

---

## 🎯 5. Top 5 Interview Questions & Short Answers (2-Year Dev Level)

### Q1: "Why do you store the `SessionToken` in CacheStore if you are already using JWT tokens?"
> **Answer:**
> "JWT tokens are stateless by default, meaning you cannot easily revoke them until they expire. 
> By saving the `SessionToken` in CacheStore (Redis), we can instantly enforce:
> 1. **Immediate Logout / Session Revocation**: When a user logs out, we remove it from CacheStore. The very next API request fails.
> 2. **Prevent Concurrent Logins**: If the user logs in from a second browser, the CacheStore value updates, so the first browser session becomes invalid immediately.
> 3. **Idle Session Timeout**: If a user is inactive, the cache key expires automatically."

---

### Q2: "How does the Asymmetric Key work in your JWT token?"
> **Answer:**
> "We use **RSA X.509 Certificates**:
> * **Private Key (Signing)**: Stored securely on the server / Windows Certificate Store. The Gateway uses this Private Key to sign the JWT token so clients cannot forge it.
> * **Public Key (Validation)**: Used by the Gateway's `JwtBearer` validation middleware to verify the signature of incoming tokens on every request."

---

### Q3: "What is AES-GCM and why do you use it for request payload encryption?"
> **Answer:**
> "AES-GCM is an authenticated symmetric encryption algorithm. 
> We use it to encrypt request and response payloads between Angular and the Gateway. It provides two things:
> 1. **Confidentiality**: Nobody can read sensitive financial payload data in transit.
> 2. **Integrity**: It generates a 16-byte authentication tag. If an attacker modifies even a single character in the encrypted payload, decryption fails with an `AuthenticationTagMismatchException` and the request is rejected."

---

### Q4: "What is the purpose of the `x-fnq-req` and `x-fnq-rep` headers?"
> **Answer:**
> "These are **HMAC-SHA256 anti-tampering headers**:
> * `x-fnq-req`: Angular creates a hash of `(RequestURL + Body)` using the `SessionToken + IDORKey`. The Gateway re-computes this hash. If they don't match, it means the URL or payload was tampered with in transit.
> * `x-fnq-rep`: The Gateway generates this hash on the response body so Angular can verify that the response actually came from the Gateway without modification."

---

### Q5: "What happens if a user cancels a request or closes the browser while an API call is running?"
> **Answer:**
> "In ASP.NET Core, we pass the `HttpContext.RequestAborted` `CancellationToken` into `HttpClient.Send(..., cancellationToken)`. 
> If the user closes the browser or aborts the request, the cancellation token cancels the downstream HTTP call and returns **HTTP 499 (Client Closed Request)**. This prevents our backend microservices from running useless queries and wasting server resources."

---

## 📋 6. Quick Architecture Keyword Table

| Term | What it means in your project |
| :--- | :--- |
| **API Gateway** | The single entry point (`GatewayControllerV2`) that validates tokens, decrypts data, and proxies requests. |
| **LSS** | Login and Security Service — backend identity service that checks database credentials. |
| **CacheStore** | Distributed Redis/memory store keeping active `LSSSessionToken_{UserID}` for concurrent/timeout control. |
| **OpenIddict** | The .NET library inside the Gateway that issues and validates OAuth 2.0 / OIDC JWT tokens. |
| **Asymmetric RSA Cert** | X.509 Certificate used to sign and verify JWT tokens securely. |
| **AES-GCM** | 256-bit symmetric encryption used to encrypt request and response bodies. |
| **HMAC-SHA256** | Hash signature in `x-fnq-req` header to detect request tampering. |
| **CancellationToken** | Stops backend processing and returns HTTP 499 if the client disconnects. |

## ❓ 2. Your Specific Doubts Answered Clearly

### Q1: "So does the token come from LSS?"
* **No, LSS returns a `SessionToken` (a raw database session GUID), NOT the JWT token.**
* **The API Gateway is the one that creates and issues the JWT token.**
* **Exact Step**:
  1. LSS authenticates the user against the database and returns:
     - `UserInfo` (`UserID`, `UserName`, `GroupID`, `HomeEntityID`, `CSVOfMappedEntityIDs`, `UserRole`)
     - `SessionToken` (e.g. `d3b07384-d113-4f49-9cf9-e2b234123456`)
  2. The API Gateway takes that `SessionToken` + `UserInfo`, embeds them into claims using `ClaimsManager.cs`, and uses **OpenIddict** to generate the signed **JWT Access Token**.

---

### Q2: "Angular receives a JWT token and Cookies? What is inside the Cookies?"
When Angular logs in, the Gateway sends both a JWT Access Token in the JSON response and sets **4 secure HttpOnly cookies**:

| Cookie Name | What is inside it? | Why is it used? |
| :--- | :--- | :--- |
| **`XSRF-TOKEN`** / `.Aspnet.AntiforgeryToken` | Anti-CSRF verification token | Prevents **Cross-Site Request Forgery** attacks. Angular reads this and sends it back in `X-XSRF-TOKEN` header. |
| **`.<ORG>.Auth`** | Encrypted ASP.NET Cookie | Keeps the user's browser session authenticated for MVC/Razor server-rendered views and TempData. |
| **`.<ORG>.Route`** | Encrypted Login Route | Remembers where the user was before logging in so it can safely redirect after login/logout without open redirect vulnerabilities. |
| **`.AspNet.Consent`** | Consent flag (`"YES"`) | Stores user cookie policy acceptance. |

---

### Q3: "What is the Concurrent Check and how does it work?"
**The Problem**: How do you prevent a user from sharing their account or logging in from two browsers simultaneously?

**How our Gateway solves it in `LSSSessionTokenCacheStore.cs`**:
1. When User `john` logs in on **Chrome (Device 1)**:
   - LSS gives `SessionToken = "AAA"`.
   - Gateway saves in CacheStore (Redis):
     $$\text{Key: } \texttt{LSSSessionToken\_john} \implies \text{Value: } \texttt{"AAA"}$$
2. If `john` (or someone else) logs in on **Firefox (Device 2)**:
   - LSS generates a new `SessionToken = "BBB"`.
   - Gateway overwrites Redis:
     $$\text{Key: } \texttt{LSSSessionToken\_john} \implies \text{Value: } \texttt{"BBB"}$$
3. When **Chrome (Device 1)** makes its next API call:
   - Chrome sends its JWT containing claim `session_token = "AAA"`.
   - Gateway reads Redis: `LSSSessionToken_john` is `"BBB"`.
   - **Mismatch!** `"AAA" != "BBB"`.
   - Gateway immediately blocks Chrome with **HTTP 401 Unauthorized** ("Invalid Session / Already logged in elsewhere") and triggers logout!

*(Optionally, if `BlockConcurrentSessions = true`, Device 2 is blocked from logging in entirely if Device 1 is already active).*

---

### Q4: "How does AES-GCM Decryption work with the Session Key?"
**The Problem**: We don't want plain JSON (passwords, bank account numbers, trade amounts) traveling in clear text, even over HTTPS.

**How it works in `EncodeDecodeMessage.cs`**:
1. **Dynamic Session Key Derivation**:
   Both Angular and the Gateway know the `SessionToken` (GUID). Neither of them hardcodes an encryption key!
   $$\text{SessionKey} = \Big(\text{SessionToken} + \text{Reverse}(\text{SessionToken})\Big)\text{.Replace("-", "")}$$
   *(Example: If `SessionToken` is `abcd-1234`, Key becomes `abcd12344321dcba`)*.
2. **Angular Encrypts**:
   - Angular takes the plaintext JSON request.
   - Generates a random 12-byte IV (Initialization Vector).
   - Encrypts using `AesGcm` with the Session Key $\rightarrow$ produces `Ciphertext + 16-byte Auth Tag + IV`.
3. **Gateway Decrypts (`GatewayControllerV2`)**:
   - Gateway extracts the IV, Ciphertext, and 16-byte Auth Tag.
   - Calls `AesGcm.Decrypt(iv, ciphertext, tag, plaintextBytes)`.
   - **If an attacker modified even 1 letter in the encrypted body**, the 16-byte Auth Tag will NOT match, throwing an `AuthenticationTagMismatchException`. Gateway rejects the call with **401 Unauthorized**.

---

### Q5: "How does Hash Verification (`x-fnq-req`) work to detect tampering?"
**The Problem**: What if a hacker intercepts a request and tries to change the URL (e.g., from `/api/v2/account/101` to `/api/v2/account/999`)?

**How it works in `GenerateValidateHash.cs`**:
1. **Angular generates HMAC-SHA256**:
   $$\text{Hash} = \text{HMAC-SHA256}\Big(\text{RequestURL.ToLower()} + \text{RequestBody}, \text{SessionToken} + \text{IDORKey}\Big)$$
   Angular puts this hash string in header: `x-fnq-req`.
2. **Gateway Verifies (`ValidateHash`)**:
   - Gateway recalculates the exact same HMAC-SHA256 formula on the server.
   - Compares: $\text{Incoming Header } \texttt{x-fnq-req} \stackrel{?}{=} \text{Computed Hash}$.
   - **If they match**: Request is safe $\rightarrow$ Proceed.
   - **If they don't match**: Someone modified the URL, query parameter, or body in transit! Gateway logs `"Request tampering detected"` in `RequestTamper.log` and returns **401 Unauthorized**.

---

### Q6: "What is inside the JWT? If JWT already has `UserID`, why do we inject it again into downstream headers?"
**What is inside our JWT Access Token (`ClaimsManager.cs`)**:
* `sub` / `user_id`: e.g. `"USR10045"`
* `session_token`: e.g. `"d3b07384-d113-4f49-9cf9-e2b234123456"`
* `UserRole`: e.g. `"Trader"` or `"Dealer"`
* `GroupID`: e.g. `"GRP_TREASURY"`
* `HomeEntityID`: e.g. `"101"` (Legal Entity / Branch ID)
* `CSVOfMappedEntityIDs`: e.g. `"101,102,105"`
* `DeviceID`, `DeviceType`, `ClientMachineIP`

**Why the Gateway extracts claims and injects them into downstream HTTP headers**:
1. **Downstream Microservices (Trade, Orders, Pricing) don't need to do JWT decryption**:
   - The Gateway is the **security guard at the front door**. It does the heavy cryptographic validation, RSA checking, and Redis session lookup *once*.
2. **Performance & Simplicity**:
   - Downstream microservices run on a private, secured internal network.
   - They simply read `X-UserID: USR10045` and `X-HomeEntityID: 101` from the request headers sent by the Gateway and run their SQL queries.
   - This keeps backend microservices fast, lightweight, and decoupled from JWT libraries.

---

## 🌐 3. What Other Authentication Flows Exist in Our Gateway?

In addition to standard **Username/Password login**, our <ORG> Gateway supports **3 other enterprise flows**:

```
+-----------------------------------------------------------------------------------------------+
|                                <ORG> GATEWAY AUTHENTICATION MODES                             |
+-------------------------+------------------------------------+--------------------------------+
| Flow Name               | Used For                           | How it works                   |
+-------------------------+------------------------------------+--------------------------------+
| 1. Internal DB Login    | Standard Wealth / Portal Users     | Username + Password -> LSS     |
| 2. SAML 2.0 Web SSO     | Corporate Bank Employees (HDFC AD) | IdP (Azure AD/Okta) -> SAML2   |
| 3. Two-Factor (2FA/OTP) | High-Security / Sensitive Accounts | OTP sent via Email/SMS -> TOTP |
| 4. Refresh Token + Bio  | Mobile Apps (iOS / Android)        | Refresh Token + Biometric/PIN  |
+-------------------------+------------------------------------+--------------------------------+
```

### Flow 2: Enterprise SAML 2.0 Single Sign-On (SSO)
* **Who uses it?**: Bank internal employees who already logged into Windows / Azure Active Directory / Okta.
* **How it works**:
  1. User opens the portal $\rightarrow$ Gateway redirects to Bank's Identity Provider (IdP).
  2. User logs in with corporate credentials (Windows Hello / Okta).
  3. IdP sends a signed **SAML XML Assertion** back to Gateway (`/Account/AssertionConsumerService`).
  4. Gateway uses `ITfoxtec.Identity.Saml2` to verify the IdP's certificate and calls `Do<ORG>ExternalAuth()` to map the corporate employee ID to <ORG> groups.
  5. Gateway issues the standard JWT token.

### Flow 3: Two-Factor Authentication (2FA / OTP)
* **Who uses it?**: Users when `TwoFAType = OTP` is configured.
* **How it works**:
  1. After Step 1 (password verified), Gateway pauses login and generates an OTP.
  2. Saves OTP in CacheStore with an iteration counter (max 3 tries, 5-minute expiry).
  3. User enters OTP on Angular UI $\rightarrow$ Gateway verifies against CacheStore $\rightarrow$ issues JWT.

### Flow 4: Refresh Token Grant (Mobile Apps with Biometric / PIN)
* **Who uses it?**: Mobile app users who don't want to enter their password every 15 minutes.
* **How it works**:
  1. Mobile app sends `POST /oauth/token` with `grant_type=refresh_token`, along with headers `biom: true` or `Pin: 1234`.
  2. Gateway calls `LssAdministration.<ORG>InternalLogonDeviceSession()` to verify device trust and PIN.
  3. If valid, Gateway issues a fresh JWT Access Token.

---

## 🎤 4. Full Master Interview Answer (2-Year Dev Level)

If the interviewer asks: **"Walk me through the complete Authentication and API proxy flow in your Gateway."**

> **Here is your complete, natural answer:**
> 
> *"In our application, the **API Gateway (built with ASP.NET Core)** sits between our Angular frontend and internal microservices like LSS and Trade services.
> 
> **1. Login & Token Generation:**
> * The user enters their username and password on the Angular page, which sends a POST request to the Gateway.
> * The Gateway forwards these credentials to our backend **LSS (Login & Security Service)**.
> * LSS validates the user in the database, checks account status, and returns the user profile along with a unique **`SessionToken` GUID**.
> * The Gateway stores this `SessionToken` in our **CacheStore (Redis)** under `LSSSessionToken_{UserID}` with an idle session timeout.
> * Then, using **OpenIddict**, the Gateway generates a **JWT token** containing claims (`UserID`, `HomeEntityID`, `session_token`, `UserRole`), signs it with our **Asymmetric RSA Private Certificate**, and returns it to Angular along with an anti-CSRF cookie.
> 
> **2. Handling Every Subsequent Request:**
> * For all API calls (like fetching portfolios or booking trades), Angular sends the Bearer JWT token, encrypts the request payload using **AES-GCM**, and attaches an HMAC-SHA256 hash in the `x-fnq-req` header.
> * In `GatewayControllerV2`, the Gateway performs:
>   1. **JWT Verification**: Checks the token signature using the **RSA Public Certificate**.
>   2. **Concurrent & Session Check**: Checks Redis to make sure `LSSSessionToken_{UserID}` matches the token's claim. If the user logged in from another browser or logged out, it immediately returns `401 Unauthorized`.
>   3. **Payload Decryption**: Decrypts the body using AES-GCM with a session key derived from `(SessionToken + Reverse(SessionToken))`.
>   4. **Tamper Check**: Re-computes the HMAC-SHA256 hash of `(URL + Body)` and verifies it against the `x-fnq-req` header.
>   5. **Downstream Injection**: It extracts `UserID`, `HomeEntityID`, and `DeviceID` from the JWT and injects them into downstream headers before proxying the call to the Trade/Order microservice.
> * When the backend replies, the Gateway encrypts the response body, adds the `x-fnq-rep` response hash, and sends it back to Angular.
> 
> **3. Other Authentication Modes:**
> * In addition to standard DB login, our Gateway supports **SAML 2.0 Web SSO** for bank corporate users (integrating with Azure AD/Okta via ITfoxtec), **2FA OTP verification**, and **Mobile Refresh Tokens with Biometric/PIN binding**."*
