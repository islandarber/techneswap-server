import multer from "multer";

// This memoryStorage() method tells Multer to store the files in memory as a Buffer. This is useful for small files that can be easily converted into a different format, like a base64 string, before being saved to a database or processed further.
const storage = multer.memoryStorage();
//Configuring Multer to use the defined storage method
export const upload = multer({ storage: storage });