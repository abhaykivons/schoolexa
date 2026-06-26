import React from "react";
import { Head, usePage, Link, useForm } from "@inertiajs/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TextLink from "@/components/text-link";
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { LoaderCircle } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  school_name: string;
  logo: string;
  background_image: string;
  colour: string;
  uuid: string;
}

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};


const ParentRegister: React.FC = () => {
  const { company, errors, canResetPassword } = usePage().props as { company: Company; errors: any; canResetPassword: boolean };

  const { data, setData, post, processing, reset } = useForm<Required<LoginForm>>({
    email: '',
    password: '',
    remember: false,
});

const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
        onFinish: () => reset('password'),
    });
};

  return (
    <>
      <Head title="Login" />
      <div className="flex items-center justify-center min-h-screen" style={{backgroundImage: `url(/storage/${company.id}/${company.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <Card className="w-full max-w-md p-6 shadow-none rounded-4xl">
          {/* School Branding */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={`/storage/${company.id}/${company.logo}`}
              alt={company.school_name}
              className="w-15 h-15 mb-2 object-contain"
            />
            <h1 className="text-xl font-bold">{company.school_name}</h1>
          </div>

          {/* Login Form */}
          <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email or username</Label>
                        <Input
                            id="email"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email or username"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit"
                      variant="default"
                      style={{ backgroundColor: company.colour }} className="mt-4 w-full text-white" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={route('parent-registration.create', { uuid: company.uuid })} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>
        </Card>
      </div>
    </>
  );
};

export default ParentRegister;