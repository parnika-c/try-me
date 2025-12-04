import "./selectAvatar.css";
import { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';

const SelectAvatar = ({ open, onOpenChange, currentAvatar, onAvatarSelect }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [customAvatar, setCustomAvatar] = useState('');
  const fileInputRef = useRef(null);

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const resizedDataUrl = await resizeImage(file, 350, 350);
      setCustomAvatar(resizedDataUrl);
      setSelectedAvatar(resizedDataUrl);
    }
  };

  const handleAvatarClick = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleRemoveCustom = () => {
    setCustomAvatar('');
    if (selectedAvatar === customAvatar) {
      setSelectedAvatar('');
    }
  };

  const handleSave = () => {
    if (selectedAvatar) {
      onAvatarSelect(selectedAvatar);
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Choose Your Avatar</h2>

        <div className="modal-body">
          {/* Preset Avatars Grid */}
          <div>
            <p>Select a preset avatar</p>
            <div className="avatar-grid">
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarClick(avatar)}
                  className={`avatar-button ${selectedAvatar === avatar ? 'selected' : ''}`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar option ${index + 1}`}
                    onError={(e) => { e.target.src = PRESET_AVATARS[0]; }}
                    className="avatar-image"
                  />
                  {selectedAvatar === avatar && (
                    <div className="selected-overlay">
                      <Check className="check-icon" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Avatar Upload */}
          <div>
            <p>Or upload your own</p>
            <div className="upload-section">
              {customAvatar && (
                <button
                  onClick={() => handleAvatarClick(customAvatar)}
                  className={`custom-avatar ${selectedAvatar === customAvatar ? 'selected' : ''}`}
                >
                  <img
                    src={customAvatar}
                    alt="Custom avatar"
                    onError={(e) => { e.target.src = PRESET_AVATARS[0]; }}
                    className="avatar-image"
                  />
                  {selectedAvatar === customAvatar && (
                    <div className="selected-overlay">
                      <Check className="check-icon" />
                    </div>
                  )}
                </button>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="upload-button"
              >
                <Upload className="upload-icon" />
                {customAvatar ? 'Upload Different Photo' : 'Upload Photo'}
              </button>

              {customAvatar && (
                <button
                  onClick={handleRemoveCustom}
                  className="remove-button"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => onOpenChange(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedAvatar}
              className="save-button"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PRESET_AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar1',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar2',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar3',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar4',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar5',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar6',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar7',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar8',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=avatar9',
];

export { SelectAvatar };
