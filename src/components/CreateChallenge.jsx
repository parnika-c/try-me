import { useState } from 'react'
import { Calendar } from 'lucide-react'
import './CreateChallenge.css'

export const CreateChallenge = ({ onClose, onCreateChallenge }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'task-based',
    startDate: '',
    dailyGoal: '',
    unit: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      description: formData.description,
      type: formData.type === 'task-based' ? 'task' : 'value',
      startDate: formData.startDate,
      dailyGoal: formData.type === 'value-based' ? Number(formData.dailyGoal) : undefined,
      unit: formData.type === 'value-based' ? formData.unit : undefined,
    };

    try {
      const res = await fetch("http://localhost:4000/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include' // include cookies
      });

      if (!res.ok) throw new Error("Failed to create challenge");
      const data = await res.json();

      console.log("Challenge created:", data);
      setOpen(false);
      onCreateChallenge?.(data);
      setFormData({
        name: '',
        description: '',
        type: 'task-based',
        startDate: '',
        dailyGoal: '',
        unit: '',
      });
    } catch (err) {
      console.error("Error creating challenge:", err);
      alert("Failed to create challenge. Try again.");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  };

  return (
    <>
      <button className="create-btn" onClick={() => setOpen(true)}>
        <span className="create-btn__icon">+</span>
        <span>Create Challenge</span>
      </button>

      { open && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
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
                <button type="button" className="btn-cancel" onClick={()=>setOpen(false)}> Cancel </button>
                <button type="submit" className="btn-create"> Create Challenge </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateChallenge;
