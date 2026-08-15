import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { JobBoard } from './pages/JobBoard';
import { JobDetail } from './pages/JobDetail';
import { MyApplications } from './pages/MyApplications';
import { JobSeekerProfile } from './pages/JobSeekerProfile';
import { CompanyPortal } from './pages/CompanyPortal'; // Dashboard baru

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Job Seeker Routes */}
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/profile" element={<JobSeekerProfile />} />
        
        {/* Company Routes */}
        <Route path="/company/dashboard" element={<CompanyPortal />} />
      </Routes>
    </Router>
  );
}

export default App;