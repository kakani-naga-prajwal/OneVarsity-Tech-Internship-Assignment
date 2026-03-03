import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [problem, setProblem] = useState('');

  // load saved problem description from localStorage
  useEffect(() => {
    if (user) {
      const key = `user_problem_${user.email}`;
      const stored = localStorage.getItem(key);
      if (stored) setProblem(stored);
    }
  }, [user]);

  const save = () => {
    if (!user) return;
    const key = `user_problem_${user.email}`;
    localStorage.setItem(key, problem);
    alert('Problem description saved locally.');
  };

  if (!user) return null; // shouldn't happen when protected

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Account</h1>
      <div className="card p-4 space-y-3 mb-6">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        {user.nationality && <p><strong>Nationality:</strong> {user.nationality}</p>}
        {user.gender && <p><strong>Gender:</strong> {user.gender}</p>}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Describe a problem you're facing</h2>
        <textarea
          className="input w-full"
          rows={4}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Let us know if you have any issues or feedback"
        />
        <button onClick={save} className="btn-primary mt-2">
          Save Description
        </button>
      </div>
    </div>
  );
}
