const fs = require('fs');
const files = ['clientes.css', 'factura.css', 'facturas.css', 'dashboard.css', 'login.css', 'productos.css', 'usuarios.css', 'ver-factura.css'];

const unifiedSidebarCss = `
/* ============================================
   SIDEBAR UNIFICADO
   ============================================ */

.sidebar {
  width: 280px !important;
  min-width: 280px !important;
  height: 100vh !important;
  background: #ffffff !important;
  border-right: 1px solid #cbd5e1 !important;
  padding: 28px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0 !important;
  transition: all 0.25s ease !important;
}

.sidebar-brand {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  margin-bottom: 28px !important;
}

.sidebar-logo-img {
  width: 52px !important;
  height: 52px !important;
  object-fit: contain !important;
  border-radius: 14px !important;
  background: #f0f4ff !important;
  padding: 6px !important;
  box-shadow: none !important;
}

.sidebar-brand h2 {
  font-size: 16px !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  margin: 0 !important;
  line-height: 1.3 !important;
}

.sidebar-brand p {
  font-size: 11px !important;
  color: #64748b !important;
  margin-top: 4px !important;
}

.sidebar-user-info-top {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
  padding: 0 0 20px 0 !important;
  margin-bottom: 20px !important;
  border-bottom: 1px solid #cbd5e1 !important;
}

.sidebar-user-avatar {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  flex-shrink: 0 !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
}

.sidebar-user-details {
  flex: 1 !important;
}

.sidebar-user-details strong {
  display: block !important;
  font-size: 18px !important;
  font-weight: 800 !important;
  color: #0f172a !important;
}

.sidebar-user-details .user-role {
  display: block !important;
  font-size: 13px !important;
  color: #64748b !important;
  margin-top: 4px !important;
}

.theme-toggle-sidebar {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 40px !important;
  padding: 8px 14px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #475569 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
}

.theme-toggle-sidebar:hover {
  background: #e2e8f0 !important;
  transform: translateY(-1px) !important;
}

.sidebar-nav {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
}

.sidebar-nav .nav-link {
  text-decoration: none !important;
  color: #334155 !important;
  font-weight: 600 !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  transition: all 0.2s ease !important;
  background: transparent !important;
  box-shadow: none !important;
}

.sidebar-nav .nav-link:hover {
  background: #eef2ff !important;
  color: #2563eb !important;
}

.sidebar-nav .nav-link.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
}

.sidebar-footer {
  margin-top: auto !important;
  padding-top: 20px !important;
  border-top: 1px solid #cbd5e1 !important;
}

.sidebar-logout {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  background: #f1f5f9 !important;
  border: 2px solid #cbd5e1 !important;
  color: #1e293b !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  cursor: pointer !important;
  padding: 14px 16px !important;
  border-radius: 14px !important;
  transition: all 0.2s ease !important;
}

.sidebar-logout:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4) !important;
}

.dashboard-layout.sidebar-collapsed .sidebar {
  width: 0 !important;
  min-width: 0 !important;
  padding: 0 !important;
  border: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* DARK MODE SIDEBAR */
body.dark-mode .sidebar {
  background: #0f172a !important;
  border-right-color: #475569 !important;
}

body.dark-mode .sidebar-brand h2 {
  color: #f8fafc !important;
}

body.dark-mode .sidebar-user-info-top {
  border-bottom-color: #475569 !important;
}

body.dark-mode .sidebar-user-details strong {
  color: #f8fafc !important;
}

body.dark-mode .sidebar-user-details .user-role {
  color: #94a3b8 !important;
}

body.dark-mode .sidebar-nav .nav-link {
  color: #cbd5e1 !important;
}

body.dark-mode .sidebar-nav .nav-link:hover {
  background: #1e293b !important;
  color: #60a5fa !important;
}

body.dark-mode .sidebar-footer {
  border-top-color: #475569 !important;
}

body.dark-mode .theme-toggle-sidebar {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #94a3b8 !important;
}

body.dark-mode .theme-toggle-sidebar:hover {
  background: #334155 !important;
  color: #f8fafc !important;
}

body.dark-mode .sidebar-logout {
  background: #1e293b !important;
  border-color: #475569 !important;
  color: #f8fafc !important;
}

body.dark-mode .sidebar-logout:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
}
`;

files.forEach(file => {
  const path = 'FrontEnd/css/' + file;
  if (!fs.existsSync(path)) return;

  let content = fs.readFileSync(path, 'utf8');

  const startIdx = content.indexOf('/* SIDEBAR UNIFICADO');
  if (startIdx !== -1) {
    content = content.substring(0, startIdx);
  }

  fs.writeFileSync(path, content + '\n\n' + unifiedSidebarCss);
  console.log('Unified CSS applied to ' + file);
});
