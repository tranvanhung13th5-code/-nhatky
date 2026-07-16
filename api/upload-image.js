import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';

// Cấu hình Cloudinary (Các giá trị này lấy từ Environment Variables trên Vercel)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Cấu hình để Next.js API không tự động parse body (cần thiết cho form-data)
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi parse form: ' + err.message });
    }

    try {
      // 'image' là tên key bạn gửi từ frontend (formData.append('image', file))
      const file = files.image[0]; 
      
      if (!file) {
        return res.status(400).json({ error: 'Không tìm thấy file ảnh' });
      }

      // Upload lên Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'nhatky_story', // Tên thư mục trên Cloudinary
      });

      // Trả về URL ảnh để frontend lưu vào Firestore
      res.status(200).json({ url: result.secure_url });
    } catch (uploadErr) {
      console.error("Cloudinary Error:", uploadErr);
      res.status(500).json({ error: 'Lỗi upload lên Cloudinary' });
    }
  });
}

