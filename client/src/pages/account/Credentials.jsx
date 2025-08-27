import { useEffect, useRef, useState } from 'react';
import LogWall from '@/components/auth/LogWall';
import { validatePassword, validateUsername } from '@/tools/validate';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '@/components/auth/PasswordInput';
const API = import.meta.env.VITE_API_BASE_URL;

export default function Credentials() {
  const [user, setUser] = useState({});
  
  const [changingUsername, setChangingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordCheck, setNewPasswordCheck] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadAccountInfo = async () => {
    const res = await fetch(`${API}/account/get`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
    } else {
      alert(data.message || 'Loading failed.');
    }
  }
  
  useEffect(() => {
    loadAccountInfo();
  }, []);

  const handleSetNewUsername = async () => {
    const err = validateUsername(newUsername);
    if (err) {
      setUsernameError(err);
      return;
    }

    const res = await fetch(`${API}/account/changeusername`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ newUsername }),
    });

    const data = await res.json();
    if (res.ok) {
      setChangingUsername(false);
      setUsernameError('');
      setNewUsername('');
      localStorage.setItem('username', newUsername);
      loadAccountInfo();
    } else {
      setUsernameError(data.message || 'Server Error.');
    }
  }

  const handleSetNewEmail = async () => {
    if (!newEmail) {
      setEmailError('Please input a new email');
      return;
    }
    if (!emailRef.checkValidity()) {
      emailRef.reportValidity();
      return;
    }

    const email = newEmail.toLowerCase();

    const res = await fetch(`${API}/account/changeemail`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ email, password: oldPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setChangingEmail(false);
      setEmailError('Please check your updated email inbox to verify yourself');
      setNewEmail('');
      loadAccountInfo();
    } else {
      setEmailError(data.message || 'Server Error.');
    }
  }

  const handleSetNewPassword = async () => {
    if (newPassword != newPasswordCheck) { setPasswordError("Passwords don't match"); return; };

    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    const res = await fetch(`${API}/account/changepassword`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setChangingPassword(false);
      setPasswordError('Password succesfully updated');
      setOldPassword('');
      setNewPassword('');
      setNewPasswordCheck('');
      logout();
      navigate("/login");
    } else {
      setPasswordError(data.message || 'Server Error.');
    }

  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (changingUsername) {
        handleSetNewUsername();
      } else if (changingEmail){
        handleSetNewEmail();
      } else if (changingPassword) {
        handleSetNewPassword();
      }
    }
  }

  const focus = (node) => {
    if (node) {
      node.focus();
    }
  }

  let emailRef = null;
  const emailFocus = (node) => {
    if (node) {
      emailRef = node
      if (!oldPassword)
        node.focus();
    } else
      emailRef = null
  }
  let passwordRef = null;
  const passwordFocus = (node) => {
    if (node) {
      passwordRef = node
      if (!newPassword && !newPasswordCheck)
        node.focus();
    } else
      passwordRef = null
  }

  return (
    <>
      <LogWall />
      <h1 className='title'>Credentials</h1>
      <div>
        <p>Username: { changingUsername ? (
            <input type="text" name="newUsername" id="newUsername" className='textfield p-1 ml-2'
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              ref={focus}
              onKeyDown={handleKeyDown}
              placeholder='New Username'
            />
          ) : <span className='font-semibold'>{user.username}</span>} {usernameError}
        </p>
        <div className='mt-2'>
          { changingUsername ? (
            <>
              <button className='ml-4 button py-1' onClick={() => { setChangingUsername(false); setNewUsername(''); setUsernameError(''); }}>Cancel</button>
              <button className='ml-4 button py-1' onClick={handleSetNewUsername}>Set</button>
            </>
          ) : (
            <button className='ml-4 button py-1' onClick={() => { setChangingUsername(true); } }>Change</button>
          ) }
        </div>
      </div>
      <div className='mt-8'>
        <p>Email: { changingEmail ? (
          <>
            <input type="email" name="newEmail" id="newEmail" className='textfield p-2 ml-2'
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              ref={emailFocus}
              onKeyDown={handleKeyDown}
              placeholder='New Email' />
            <input type="password" name="password" id="password" className='textfield p-2 ml-4'
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Your Password' />
          </>) : <span className='font-semibold'>{user.email}</span>} {emailError}
        </p>
        <div className='mt-2'>
          {!user.isGoogle ? 
            (<>{ changingEmail ? (
                <>
                  <button className='ml-4 button py-1' onClick={() => { setChangingEmail(false); setNewEmail(''); setEmailError(''); setOldPassword(''); }}>Cancel</button>
                  <button className='ml-4 button py-1' onClick={handleSetNewEmail}>Set</button>
                </>
              ) : (
                <button className='ml-4 button py-1' onClick={() => setChangingEmail(true)}>Change</button>
              )
            }</>) 
            : 
            (<p className='pl-4'>Cannot be changed (Google login used)</p>)}
        </div>
      </div>
      {!user.isGoogle && (
      <div className='mt-8 [&>*]:mt-2'>
        <p className='inline mr-2'>Password: </p>
        { changingPassword ? (
        <>
          <PasswordInput 
            placeholder="Current password" name="oldPassword" id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={passwordFocus}
          />
          <PasswordInput 
            placeholder="New password" name="newPassword" id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <PasswordInput 
            placeholder="New password again" name="newPasswordCheck" id="newPasswordCheck"
            value={newPasswordCheck}
            onChange={(e) => setNewPasswordCheck(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </>
        ) : <span>••••••••</span>} {passwordError}
        <div className='mt-2'>
          { changingPassword ? (
            <>
              <button className='ml-4 button py-1' onClick={() => { setChangingPassword(false); setNewPassword(''); setNewPasswordCheck(''); setOldPassword(''); setPasswordError(''); }}>Cancel</button>
              <button className='ml-4 button py-1' onClick={handleSetNewPassword}>Set</button>
            </>
          ) : (
            <button className='ml-4 button py-1' onClick={() => { setChangingPassword(true); } }>Change</button>
          ) }
        </div>
      </div>)}
    </>
  );
}