import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/home"); // Redirect to Login Page
  }, []);
  return null;
}
