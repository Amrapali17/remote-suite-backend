
import { supabase } from "../supabaseClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { fullName, email, password, contactNumber } = req.body;
  if (!fullName || !email || !password || !contactNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([{
        name: fullName,
        email,
        password: hashedPassword,
        contactnumber: contactNumber,
        role: "user"
      }])
      .select()
      .single();

    if (userError) throw userError;

  
    await supabase
      .from("workspaces")
      .insert([{ name: `${fullName}'s Workspace`, owner_id: user.id, members: [user.id] }]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) return res.status(400).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
