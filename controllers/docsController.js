
import { supabase } from '../supabaseClient.js';

export const getDocs = async (req, res) => {
  const { workspace_id } = req.query;
  try {
    const { data, error } = await supabase
      .from('docs')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: true });

    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createDoc = async (req, res) => {
  const { workspace_id, title, content } = req.body;
  try {
    const { data, error } = await supabase
      .from('docs')
      .insert([{ workspace_id, title, content }])
      .select();

    if (error) return res.status(400).json({ error });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateDoc = async (req, res) => {
  const { doc_id } = req.params;
  const { title, content } = req.body;

  try {
    const updateObj = {};
    if (title !== undefined) updateObj.title = title;
    if (content !== undefined) updateObj.content = content;
    updateObj.updated_at = new Date();

    const { data, error } = await supabase
      .from('docs')
      .update(updateObj)
      .eq('id', doc_id)
      .select();

    if (error) return res.status(400).json({ error });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteDoc = async (req, res) => {
  const { doc_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('docs')
      .delete()
      .eq('id', doc_id)
      .select();

    if (error) return res.status(400).json({ error });
    res.json({ message: 'Doc deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveDocSnapshot = async (doc_id, content) => {
  try {
    await supabase
      .from('docs')
      .update({ content, updated_at: new Date() })
      .eq('id', doc_id);
  } catch (err) {
    console.error('Error saving Yjs snapshot:', err.message);
  }
};
