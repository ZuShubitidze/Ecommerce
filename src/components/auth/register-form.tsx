import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Register Form Props
interface RegisterFormProps {
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}
// Register Form Component
const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
}) => {
  return (
    // Form Card
    <Card>
      {/* Header */}
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Enter your email and password below to register your account
        </CardDescription>
      </CardHeader>
      {/* Content */}
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            {/* Password */}
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {/* Actions */}
            <Field>
              <Button type="submit">Register</Button>
              <Button variant="outline" type="button">
                Register with Google
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <a href="/auth/login">Sign in</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
