import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "../utils/api";
import React from "react";

type Link = {name: string, path: string}

const adminLinks : Link[] = [
    { name: "Kiosk", 
     path: "/admin/kiosk" 
    },
    {
      name: "Serial",
      path: "/admin/serial",
    }
];

const dashLinks : Link[] = [
    { 
        name: "Overview",
        path: "/dash/overview"
    },
    {
        name: "Logs",
        path: "/dash/logs",
    },
]


const NavBar : React.FC<{links: Link[]}> = (props: {links: Link[]}) => {

    const { data: session } = useSession();
  return (
        <nav className="flex items-center justify-center bg-[#EBE451] sticky top-0 z-50">
            <div className="container flex flex-row items-center w-full justify-start py-3 gap-12 ">
            {props.links.map((link, index) => {
            return (
                <ul key={index} className="text-ml font-extrabold tracking-tight text-neutral-800 hover:text-neutral-600" >
                    <Link href={link.path} >
                        <li key={index}>{link.name}</li>
                    </Link>
                </ul>
            );
            })}
            <div className="grow"/>
            <p className="flex text-neutral-800">{session?.user.email}</p>
            <button
                className="text-ml font-extrabold text-neutral-800 no-underline hover:text-neutral-600"
                onClick={() => signOut()}
                >
                Log out
            </button>   
            </div>        
        </nav>
  );
};

export const AdminNavBar : React.FC = () => {
    return(
        <NavBar links={adminLinks}/>
    )
}

export const DashNavBar : React.FC = () => {
    return(
        <NavBar links={dashLinks}/>
    )
}
