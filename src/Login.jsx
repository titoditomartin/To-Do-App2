import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from './firebase/auth';
import { useUser } from './contexts/authContext/UserContext.jsx';
import './login.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    const lowerCaseEmail = email.toLowerCase();
    try {
      await doSignInWithEmailAndPassword(lowerCaseEmail, password);
      login(lowerCaseEmail);
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error("Authentication error:", error);
      // Handle authentication error
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await doSignInWithGoogle();
      const userEmail = result.user.email.toLowerCase();
      login(userEmail);
      // Redirect to dashboard after successful login with Google
      navigate('/dashboard');
    } catch (error) {
      console.error("Google authentication error:", error);
      // Handle Google authentication error
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-heading">Login</h2>
        <div className="form-field">
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <input 
            type="password" 
            className="input-field" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="login-button">Login</button> 
          <button type="button" className="signup-button" onClick={() => navigate('/signup')}>Sign Up</button> 
        </div>
        <button type="button" className="google-login-button" onClick={handleGoogleSignIn}>Sign in with Google</button>
      </form>
    </div>
  );
};

export default LoginForm;
