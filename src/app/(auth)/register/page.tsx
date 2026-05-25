import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#0D1236]">
          Join the Network
        </h2>
        <p className="text-sm text-[#4A5568]">
          List your skills, specify matches, and begin trading knowledge.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
