import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import './CreateChallengeModal.css'

export const CreateChallengeModal = ({ onClose, onCreateChallenge }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'task-based',
    startDate: '',
    dailyGoal: '',
    unit: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateChallenge(formData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <h2>Create New Challenge</h2>
            <p>Set up a 7-day challenge to compete with friends</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Challenge Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="ex. 10K Steps Daily"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your challenge..."
              required
            />
          </div>

          <div className="form-group">
            <label>Challenge Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="type"
                  value="task-based"
                  checked={formData.type === 'task-based'}
                  onChange={(e) => handleChange('type', e.target.value)}
                />
                <span className="radio-label">Task-based</span>
                <br></br>
                <span className="radio-description">Simple daily completion (ex. meditation, no social media)</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="type"
                  value="value-based"
                  checked={formData.type === 'value-based'}
                  onChange={(e) => handleChange('type', e.target.value)}
                />
                <span className="radio-label">Value-based</span>
                <br></br>
                <span className="radio-description">Track a numeric goal (ex. 10,000 steps, 30 minutes reading)</span>
              </label>
            </div>
          </div>

          {formData.type === 'value-based' && (
            <>
              <div className="form-group">
                <label htmlFor="dailyGoal">Daily Goal</label>
                <input
                  type="number"
                  id="dailyGoal"
                  value={formData.dailyGoal}
                  onChange={(e) => handleChange('dailyGoal', e.target.value)}
                  placeholder="ex. 10000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  placeholder="ex. steps, minutes"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <div className="date-input">
              <Calendar className="date-icon" size={20} />
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}> Cancel </button>
            <button type="submit" className="btn-create"> Create Challenge </button>
          </div>
        </form>
      </div>
    </div>
  )
}
