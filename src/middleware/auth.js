export function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  req.flash('error', 'Bejelentkezés szükséges.');
  res.redirect('/login');
}

export function ensureRole(role) {
  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user.role === role) return next();
    req.flash('error', 'Nincs jogosultság.');
    res.redirect('/');
  };
}
