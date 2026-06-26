import React from "react";
import { Head, usePage, Link, useForm } from "@inertiajs/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TextLink from "@/components/text-link";

interface Company {
  id: number;
  name: string;
  school_name: string;
  logo: string;
  background_image: string;
  colour: string;
  uuid: string;
}

const ParentRegister: React.FC = () => {
  const { company, errors } = usePage().props as { company: Company; errors: any };

  const { data, setData, post, processing } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    uuid: company.uuid,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("parent-registration.store"));
  };

  return (
    <>
      <Head title="Parent Registration" />
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
            <p className="text-gray-600">Parent Registration</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input type="hidden" name="uuid" value={company.uuid} />
            <div>
              <Label className="mb-2" htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <Label className="mb-2" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <Label className="mb-2" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div>
              <Label className="mb-2" htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              style={{ backgroundColor: company.colour }}
              className={`w-full`}
              disabled={processing}
            >
              {processing ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <TextLink href={route("school-login.index", { uuid: company.uuid })} tabIndex={11}>
              Log in
            </TextLink>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ParentRegister;