import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import FeedPage from './pages/FeedPage'; 
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* LAYOUT ROUTES (Sidebar Visible) */}
        <Route path="/" element={<MainLayout />}>
           <Route index element={<FeedPage />} /> 
        </Route>

        {/* FULL PAGE ROUTES (No Sidebar) */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        
      </Routes>
    </BrowserRouter>
  );
}