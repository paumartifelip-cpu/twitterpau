-- 1. Crear tabla de POSTS
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL, -- Usaremos el device_id
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Crear tabla de LIKES
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, device_id) -- Un like por persona/post
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS PARA POSTS
-- Cualquier puede ver los posts
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
-- Cualquier puede crear posts
CREATE POLICY "Public insert posts" ON posts FOR INSERT WITH CHECK (true);
-- SOLO el autor puede borrar su post (si author_id coincide con el enviado)
CREATE POLICY "Author can delete own posts" ON posts FOR DELETE USING (auth.role() = 'anon'); 
-- OJO: Como usamos anon sin auth real, simplificaremos permitiendo borrar si el author_id coincide
-- Pero en Supabase sin Auth, el author_id debe manejarse en la lógica del cliente. 
-- Para este ejercicio, permitiremos DELETE basándonos en una condición simple o dejándolo abierto para "anon".
DROP POLICY IF EXISTS "Author can delete own posts" ON posts;
CREATE POLICY "Anyone can delete" ON posts FOR DELETE USING (true); -- Simplificado para el prototipo

-- 5. POLÍTICAS PARA LIKES
-- Cualquier puede ver likes
CREATE POLICY "Public read likes" ON likes FOR SELECT USING (true);
-- Cualquier puede dar like
CREATE POLICY "Public insert likes" ON likes FOR INSERT WITH CHECK (true);
