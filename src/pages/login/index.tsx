import { AuthPage } from "@refinedev/mui";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title="Admin Panel Login"
      formProps={{
        defaultValues: { email: "", password: "" },
      }}
    />
  );
};
