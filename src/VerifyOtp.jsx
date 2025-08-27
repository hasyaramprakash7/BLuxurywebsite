//  router.post("/register", async (req, res) => {
//   const { name, email, password, address, phone } = req.body;

//   if (!name || !email || !password || !address || !phone) {
//     return res.status(400).json({ success: false, message: "Please fill all fields" });
//   }

//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists)
//       return res.status(400).json({ success: false, message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, password: hashedPassword, address, phone });
//     await newUser.save();

//     const token = generateToken(newUser);

//     // Example: sending user data to vendor (optional)
//     // await axios.post(VENDOR_API_URL, { ... });

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user: { id: newUser._id, name: newUser.name, email: newUser.email, address, phone },
//       token,
//     });
//   } catch (error) {
//     console.error("Registration Error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });