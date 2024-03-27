import React, { useState, useEffect } from "react"; 
import { useNavigate } from 'react-router-dom'; 
import { useUser } from './contexts/authContext/UserContext'; 
import {
  doc,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from "./firebase/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userEmail } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (userEmail) {
      const userProfileRef = doc(db, 'UserProfile', userEmail);
      const unsubscribe = onSnapshot(userProfileRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setDisplayName(userData.displayName || userEmail);
          setProfilePicUrl(userData.profilePicture || '');
        }
      }, (error) => {
        console.error("Error fetching user profile: ", error);
      });
      return () => unsubscribe();
    }
  }, [userEmail]);

  const handleDisplayNameEdit = () => {
    setIsEditingDisplayName(true);
    setNewDisplayName(displayName); // Set the current display name in the input field
  };

  const handleSaveDisplayName = () => {
    setIsEditingDisplayName(false);
    // Update the display name in the database
    const userProfileRef = doc(db, 'UserProfile', userEmail);
    const updatedProfile = { displayName: newDisplayName };
    setDoc(userProfileRef, updatedProfile, { merge: true })
      .catch((error) => {
        console.error("Error updating display name: ", error);
      });
  };

  const handleProfilePictureUpload = () => {
    if (!profilePic) return;

    const storageRef = ref(getStorage(), `profile_pictures/${userEmail}`);
    uploadBytes(storageRef, profilePic).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        setProfilePicUrl(downloadURL);
        updateUserProfile({ profilePicture: downloadURL });
      });
    }).catch((error) => {
      console.error("Error uploading profile picture: ", error);
    });
  };

  const updateUserProfile = (updates) => {
    const userProfileRef = doc(db, 'UserProfile', userEmail);

    setDoc(userProfileRef, updates, { merge: true })
      .then(() => {
        // Optionally handle success
      })
      .catch((error) => {
        console.error("Error updating user profile: ", error);
      });
  };

  const handleCancelEdit = () => {
    setIsEditingDisplayName(false);
  };

  const handleSignOut = () => {
    navigate('/dashboard');
  };

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <div className="profile-details">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-pic default-pic"></div>
          )}
          <p>Welcome back, {isEditingDisplayName ? (
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
          ) : (
            <span>{displayName}</span>
          )}</p>
          {isEditingDisplayName ? (
            <div>
              <button onClick={handleSaveDisplayName} className="save-btn">Save</button>
              <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
            </div>
          ) : (
            <button onClick={handleDisplayNameEdit} className="edit-btn">Edit Display Name</button>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
          <button onClick={handleProfilePictureUpload} className="upload-btn">Upload Profile Picture</button>
          <button onClick={handleSignOut} className="sign-out-btn">Return</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
