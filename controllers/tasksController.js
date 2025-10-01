import { supabase } from "../supabaseClient.js";


export const createTask = async (req, res) => {
  const { workspace_id, title, description, status, assigned_to } = req.body;
  if (!workspace_id || !title) return res.status(400).json({ error: "workspace_id and title required" });

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ workspace_id, title, description, status, assigned_to }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTasksByWorkspace = async (req, res) => {
  const { workspace_id } = req.query;
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspace_id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTasksByUser = async (req, res) => {
  const { user_id } = req.query;
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .contains("assigned_to", [user_id]);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assigned_to } = req.body;

  const updates = { title, description, assigned_to };

  if (status) {
    updates.status = status;
    updates.completed_at = status === "completed" ? new Date().toISOString() : null;
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
