// Admin Routes
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/admin/Login";
import AdminLanding from "../pages/AdminLanding";


import WeddingSettings from "../pages/admin/WeddingSettings";
import GuestManagement from "../pages/admin/GuestManagement";
import QuotesManagement from "../pages/admin/QuotesManagement";
import BrideGroomManagement from "../pages/admin/BrideGroomManagement";
import StoryManagement from "../pages/admin/StoryManagement";

import { withAuth } from '../contexts/AuthContext';
import GalleryManagement from "../pages/admin/GalleryManagement";
import RsvpManagement from "../pages/admin/RsvpManagement";
import ThanksManagement from "../pages/admin/ThanksManagement";
import InvitedManagement from "../pages/admin/InvitedManagement";

const adminRoutes = [
  { path: "/admin/portal", component: AdminLanding },
  { path: "/admin/login", component: Login },
  { path: "/admin", component: withAuth(Dashboard) },
  { path: "/admin/dashboard", component: withAuth(Dashboard) },


  { path: "/admin/wedding-settings", component: withAuth(WeddingSettings) },
  { path: "/admin/guest-management", component: withAuth(GuestManagement) },
  { path: "/admin/quotes-management", component: withAuth(QuotesManagement) },
  { path: "/admin/bride-groom-management", component: withAuth(BrideGroomManagement) },
  { path: "/admin/story-management", component: withAuth(StoryManagement) },

  { path: "/admin/gallery-management", component: withAuth(GalleryManagement) },
  { path: "/admin/rsvp-management", component: withAuth(RsvpManagement) },
  { path: "/admin/thanks-management", component: withAuth(ThanksManagement) },
  { path: "/admin/invited-management", component: withAuth(InvitedManagement) },
];

export default adminRoutes;
