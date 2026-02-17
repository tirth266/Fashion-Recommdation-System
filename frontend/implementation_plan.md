# implementation_plan.md

## Objective
Enhance the application's authentication flow to strictly gate personalized features behind a login wall while allowing anonymous browsing. Implement a user-friendly registration prompt that preserves the user's intent (redirects back to the requested feature) and remembers dismissal.

## Core Requirements
- **Public Access**: Home, Product Listings, Static Pages.
- **Protected Access**: Recommendations, Size Customization, Profile, Checkout.
- **UX**: Immediate, friendly registration prompt upon accessing restricted features.
- **Persistence**: Remember dismissal of auth prompt per session.
- **Deep Linking**: Redirect to the original requested URL after login.

## Proposed Architecture

### 1. `AuthContext.jsx` Enhancements
- Ensure `currentUser`, `loading`, and `isAuthenticated` are robust.
- Add methods to handle "post-login redirect URL".

### 2. `AuthGuard.jsx` / `ProtectedRoute.jsx`
- A wrapper component for routes that require authentication.
- Instead of just redirecting to `/login`, it should:
    - Capture the current location.
    - Show the `AuthModal` (or redirect to Login page with state).
    
### 3. `AuthModal.jsx` (New Component)
- A reusable modal component.
- **States**: Login vs. Register.
- **Content**: 
    - Friendly message: "Hey there! To unlock personalized recommendations..."
    - Fields: Name, Email, Password, (Optional Phone).
    - Google Login integration.
- **Behavior**:
    - On success: Close modal, call `onAuthSuccess` (which navigates to the saved redirect URL).
    - On dismiss: Save `hasSeenRegistration` to `sessionStorage`.

### 4. Route Protection (App.jsx)
- Wrap sensitive routes (`/recommendations`, `/profile`, `/smart-sizing`) with `<AuthGuard>`.

### 5. Trigger Points
- Update "Get Recommendations" button on Home page to navigate to `/recommendations` (which will trigger the guard if not logged in).

## Step-by-Step Implementation

1.  **Update `AuthContext.jsx`**:
    - Verify existing logic.
    - Ensure it exposes necessary state.

2.  **Create `AuthModal.jsx`**:
    - Build the UI with Tailwind CSS (clean, modern, indigo accents).
    - Implement Login and Registration forms within the modal.
    - Handle close/dismiss logic.

3.  **Create `AuthGuard.jsx`**:
    - Logic: Check `currentUser`.
    - If no user: Render `AuthModal` (or redirect).
    - If user: Render children.

4.  **Update `App.jsx`**:
    - Apply `AuthGuard` to restricted routes.

5.  **Test Integration**:
    - Try accessing `/recommendations` as a guest.
    - Verify Modal appears.
    - Sign Up/Login.
    - Verify redirect back to `/recommendations`.

## File Structure

```
frontend/src/
  components/
    Auth/
      AuthModal.jsx       <-- NEW: Dual-mode login/signup modal
      AuthGuard.jsx       <-- NEW: Route protection wrapper
  context/
    AuthContext.jsx       <-- UPDATE: Ensure robust state
  App.jsx                 <-- UPDATE: Wrap routes
  pages/
    Home.jsx              <-- UPDATE: Ensure CTA buttons trigger protected routes
```
