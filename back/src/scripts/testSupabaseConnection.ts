import "dotenv/config";
import { supabaseClient } from "../utils/supabaseClient";

async function testSupabaseConnection() {
  try {
    // Lister tous les buckets disponibles
    const { data: buckets, error: bucketError } =
      await supabaseClient.storage.listBuckets();
    if (bucketError) throw bucketError;
    console.log("Buckets Supabase:", buckets);

    // Lister les fichiers dans le bucket "videos"
    const { data: files, error: fileError } = await supabaseClient.storage
      .from("videos")
      .list();
    if (fileError) throw fileError;
    console.log('Fichiers dans le bucket "videos":', files);
  } catch (err) {
    console.error("Erreur lors du test de connexion Supabase :", err);
    process.exit(1);
  }
}

testSupabaseConnection();
