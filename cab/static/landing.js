    (function() {
        var btn = document.getElementById('profileBtn');
        var menu = document.getElementById('profileMenu');
        var logout = document.getElementById('logoutBtn');
        if (!btn || !menu) return;

        function closeMenu() {
            menu.classList.remove('show');
            btn.setAttribute('aria-expanded', 'false');
        }

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = menu.classList.toggle('show');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', function(e) {
            if (!menu.classList.contains('show')) return;
            var target = e.target;
            if (target === btn || btn.contains(target) || menu.contains(target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMenu();
        });

        if (logout) {
            logout.addEventListener('click', function() {
                closeMenu();
                alert('Logged out');
                // TODO: integrate with real auth logout
            });
        }
    })();