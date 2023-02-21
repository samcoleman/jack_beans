import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "../utils/api";


const navLinks = [
    { name: "Kiosk", 
     path: "/admin/kiosk" 
    },
    {
      name: "Serial",
      path: "/admin/serial",
    }
];


const NavBar = () => {
    //const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
        <nav className="flex flex-row items-center w-full justify-start gap-12 px-24 py-3 bg-gray-600">
            {navLinks.map((link, index) => {
            return (
                <ul className="text-ml font-extrabold tracking-tight text-white ">
                    <Link href={link.path} >
                        <li key={index}>{link.name}</li>
                    </Link>
                </ul>
            );
            })}
            <div className="grow"/>
            <AuthShowcase />
        </nav>
  );
};

export default NavBar;

const AuthShowcase: React.FC = () => {
    const { data: sessionData } = useSession();
  
    const { data: secretMessage } = api.example.getSecretMessage.useQuery(
      undefined, // no input
      { enabled: sessionData?.user !== undefined },
    );
  
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-center text-ml text-white">
          {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
          {secretMessage && <span> - {secretMessage}</span>}
        </p>
        <button
          className="text-ml font-semibold text-white no-underline"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Log out" : "Log in"}
        </button>
      </div>
    );
  };