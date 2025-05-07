import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Code } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Adjust the import path based on your project structure

interface NavbarProps {
  userName: string;
}

const Navbar: React.FC<NavbarProps> = ({ userName }) => {
  const [storedUserName, setStoredUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check for the username in session storage initially
    const username = sessionStorage.getItem("username");
    setStoredUserName(username);

    // Listen for changes in sessionStorage
    const handleStorageChange = () => {
      const updatedUsername = sessionStorage.getItem("username");
      setStoredUserName(updatedUsername);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="p-2 flex flex-row items-center justify-between shadow-md tracking-wide">
      <Link to="/" className="flex flex-row items-center gap-1 ml-3">
        <Code className="w-7 h-7" />
        <p className="text-2xl font-medium m-2">CodeForge</p>
      </Link>
      <div className="flex flex-row ">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                to="/playground"
                className={`${navigationMenuTriggerStyle()} text-[15px] font-medium`}
              >
                Playground
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/arena"
                className={`${navigationMenuTriggerStyle()} text-[15px] font-medium`}
              >
                Arena
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/battleground"
                className={`${navigationMenuTriggerStyle()} text-[15px] font-medium`}
              >
                Battleground
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4 ml-2">
          <div className="text-slate-300 hidden md:flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm font-light tracking-wide">
            <User className="w-4 h-4" />
            <span className="">{userName ? userName : null}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
