import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#0D1236]">
          Sign in
        </h2>
        <p className="text-sm text-[#4A5568]">
          Sign in to interact with matching skill profiles.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
