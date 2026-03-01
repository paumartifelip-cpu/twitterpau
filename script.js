// LÓGICA PRINCIPAL DE [TWITTTER PAU]

// 0. Inicializar Supabase
const { createClient } = supabase;
const _supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// 1. Identificación del dispositivo
let deviceId = localStorage.getItem('twitterpau_device_id');
if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('twitterpau_device_id', deviceId);
}

// 2. Funciones de Datos (Metáfora: Los mensajeros de la app)

const fetchPosts = async () => {
    // Traer posts y sus likes
    const { data: posts, error } = await _supabase
        .from('posts')
        .select(`*, likes(device_id)`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando posts:', error);
        return [];
    }
    return posts;
};

const createPost = async (content) => {
    const { error } = await _supabase
        .from('posts')
        .insert([{ content, author_id: deviceId }]);

    if (error) throw error;
};

const deletePost = async (postId) => {
    if (!confirm('¿Seguro que quieres borrar este mensaje?')) return;
    const { error } = await _supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) alert('Error al borrar: ' + error.message);
    else router(); // Recargar
};

const toggleLike = async (postId) => {
    // Primero vemos si ya tiene like
    const { data: existingLike } = await _supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('device_id', deviceId)
        .single();

    if (existingLike) {
        // Si ya hay like, lo quitamos
        await _supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('device_id', deviceId);
    } else {
        // Si no hay like, lo ponemos
        await _supabase
            .from('likes')
            .insert([{ post_id: postId, device_id: deviceId }]);
    }
    router(); // Recargar para actualizar contador
};

// 3. Renderizadores (Dibujando las pantallas)

const renderFeed = async () => {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="feed" class="feed-container">
            <div class="loader">Buscando noticias... 🔎</div>
        </div>
    `;

    const posts = await fetchPosts();
    const feed = document.getElementById('feed');

    if (posts.length === 0) {
        feed.innerHTML = `<p style="text-align: center; padding: 3rem; color: var(--text-muted);">
            No hay mensajes todavía. ¡Sé el primero en escribir algo! ✨
        </p>`;
        return;
    }

    feed.innerHTML = posts.map(post => {
        const date = new Date(post.created_at).toLocaleDateString();
        const time = new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const hasLiked = post.likes.some(l => l.device_id === deviceId);
        const isAuthor = post.author_id === deviceId;

        return `
            <div class="post-card glass">
                <div class="post-header">
                    <span class="author-name">@${post.author_id.slice(-5)} ${isAuthor ? '(Tú)' : ''}</span>
                    <span class="post-time">${date} ${time}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-footer">
                    <button class="btn-action btn-like ${hasLiked ? 'active' : ''}" onclick="toggleLike('${post.id}')">
                        ${hasLiked ? '❤️' : '🤍'} ${post.likes.length}
                    </button>
                    ${isAuthor ? `
                        <button class="btn-action btn-delete" onclick="deletePost('${post.id}')">
                            🗑️ Borrar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
};

const renderCreateForm = () => {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="form-container">
            <h2 style="padding: 1rem 0; font-size: 1.2rem;">¿Qué está pasando?</h2>
            <textarea id="post-text" placeholder="Escribe tu mensaje aquí..." class="glass"></textarea>
            <button id="btn-publish" class="btn-primary">Publicar</button>
        </div>
    `;

    document.getElementById('btn-publish').onclick = async () => {
        const text = document.getElementById('post-text').value;
        if (!text.trim()) return alert('¡Escribe algo primero!');

        const btn = document.getElementById('btn-publish');
        btn.disabled = true;
        btn.innerText = 'Enviando...';

        try {
            await createPost(text);
            window.location.hash = '#'; // Volver al feed
        } catch (e) {
            alert('Error al publicar: ' + e.message);
            btn.disabled = false;
            btn.innerText = 'Publicar';
        }
    };
};

// 4. Router y Utilidades
const router = () => {
    const hash = window.location.hash || '#';
    const navFeed = document.getElementById('nav-feed');
    const navNew = document.getElementById('nav-new');

    navFeed.classList.remove('active');
    navNew.classList.remove('active');

    if (hash === '#') {
        navFeed.classList.add('active');
        renderFeed();
    } else if (hash === '#new') {
        navNew.classList.add('active');
        renderCreateForm();
    }
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Inyectar clases CSS a elementos estáticos
document.querySelector('.header-glass').classList.add('glass');
document.querySelector('.bottom-nav').classList.add('glass');

// Hacer funciones globales para onclick
window.toggleLike = toggleLike;
window.deletePost = deletePost;
