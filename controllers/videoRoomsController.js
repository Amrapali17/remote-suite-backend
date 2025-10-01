import { supabase } from '../supabaseClient.js';

export const getVideoRooms = async (req, res) => {
  const { workspace_id } = req.query;
  const { data, error } = await supabase
    .from('video_rooms')
    .select('*')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error });
  res.json(data);
};


export const createVideoRoom = async (req, res) => {
  const { workspace_id, name, room_token } = req.body;
  const { data, error } = await supabase
    .from('video_rooms')
    .insert([{ workspace_id, name, room_token }])
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};

export const endVideoCall = async (req, res) => {
  const { video_room_id, participants, started_at } = req.body;


  const { data: roomData, error: fetchError } = await supabase
    .from('video_rooms')
    .select('call_history')
    .eq('id', video_room_id)
    .single();

  if (fetchError) return res.status(400).json({ error: fetchError });

  const currentHistory = roomData.call_history || [];


  const updatedHistory = [
    ...currentHistory,
    {
      started_at: started_at || new Date(),
      ended_at: new Date(),
      participants
    }
  ];

  const { data, error } = await supabase
    .from('video_rooms')
    .update({ call_history: updatedHistory })
    .eq('id', video_room_id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data);
};


export const getCallHistory = async (req, res) => {
  const { video_room_id } = req.query;

  const { data, error } = await supabase
    .from('video_rooms')
    .select('call_history')
    .eq('id', video_room_id)
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data.call_history || []);
};
