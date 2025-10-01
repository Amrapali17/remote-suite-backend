import { supabase } from "../supabaseClient.js";


export const getMessages = async (req, res) => {
  const { workspace_id } = req.query;
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("workspace_id", workspace_id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const sendMessage = async (req, res) => {
  const { workspace_id, sender_id, content, is_ai } = req.body;
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([{ workspace_id, sender_id, content, is_ai: is_ai || false }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
