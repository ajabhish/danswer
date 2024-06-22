"use client";

import {
  FiBook,
  FiEdit,
  FiFolderPlus,
  FiMenu,
  FiPlusSquare,
  FiX,
} from "react-icons/fi";
import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BasicClickable, BasicSelectable } from "@/components/BasicClickable";
import { ChatSession } from "../interfaces";
import {
  HEADER_HEIGHT,
  NEXT_PUBLIC_NEW_CHAT_DIRECTS_TO_SAME_PERSONA,
} from "@/lib/constants";
import { ChatTab } from "./ChatTab";
import { Folder } from "../folders/interfaces";
import { createFolder } from "../folders/FolderManagement";
import { usePopup } from "@/components/admin/connectors/Popup";
import { SettingsContext } from "@/components/settings/SettingsProvider";

import React from "react";
import { FaBrain } from "react-icons/fa";

export const ChatSidebar = ({
  existingChats,
  currentChatSession,
  folders,
  isChatSidebarOpen,
  toggleChatSideBar,
  openedFolders,
}: {
  isChatSidebarOpen?: boolean;
  toggleChatSideBar?: () => void;
  existingChats: ChatSession[];
  currentChatSession: ChatSession | null | undefined;
  folders: Folder[];
  openedFolders: { [key: number]: boolean };
}) => {
  const router = useRouter();
  const { popup, setPopup } = usePopup();

  const currentChatId = currentChatSession?.id;

  // prevent the NextJS Router cache from causing the chat sidebar to not
  // update / show an outdated list of chats
  useEffect(() => {
    router.refresh();
  }, [currentChatId]);

  const combinedSettings = useContext(SettingsContext);
  if (!combinedSettings) {
    return null;
  }
  const settings = combinedSettings.settings;

  const SidebarContent = ({ toggle }: { toggle?: boolean }) => (
    <>
      <div className={`pt-4 ${HEADER_HEIGHT} flex`}>
        <div className="flex mx-4 justify-between w-full">
          <Link
            className="flex"
            href={
              settings && settings.default_page === "chat" ? "/chat" : "/search"
            }
          >
            <div className="h-[32px] w-[30px]">
              <Image src="/logo.png" alt="Logo" width="1419" height="1520" />
            </div>
            <h1 className="flex text-2xl text-strong font-bold my-auto">
              Danswer
            </h1>
          </Link>

          {toggle && (
            <button onClick={toggleChatSideBar}>
              <FiX />
            </button>
          )}
        </div>
      </div>

      <div className="flex mt-5 items-center">
        <Link
          href={
            "/chat" +
            (NEXT_PUBLIC_NEW_CHAT_DIRECTS_TO_SAME_PERSONA && currentChatSession
              ? `?assistantId=${currentChatSession.persona_id}`
              : "")
          }
          className="ml-3 w-full"
        >
          <BasicClickable fullWidth>
            <div className="flex items-center text-sm">
              <FiEdit className="ml-1 mr-2" /> New Chat
            </div>
          </BasicClickable>
        </Link>

        <div className="ml-1.5 mr-3 h-full">
          <BasicClickable
            onClick={() =>
              createFolder("New Folder")
                .then((folderId) => {
                  console.log(`Folder created with ID: ${folderId}`);
                  router.refresh();
                })
                .catch((error) => {
                  console.error("Failed to create folder:", error);
                  setPopup({
                    message: `Failed to create folder: ${error.message}`,
                    type: "error",
                  });
                })
            }
          >
            <div className="flex items-center text-sm h-full">
              <FiFolderPlus className="mx-1 my-auto" />
            </div>
          </BasicClickable>
        </div>
      </div>

      <Link href="/assistants/mine" className="mt-3 mb-1 mx-3">
        <BasicClickable fullWidth>
          <div className="flex items-center text-default font-medium">
            <FaBrain className="ml-1 mr-2" /> Manage Assistants
          </div>
        </BasicClickable>
      </Link>

      <div className="border-b border-border pb-4 mx-3" />

      <ChatTab
        existingChats={existingChats}
        currentChatId={currentChatId}
        folders={folders}
        openedFolders={openedFolders}
      />
    </>
  );

  const DesktopSideBar = () => {
    return (
      <div
        className={`
        w-64
        flex
        flex-none
        bg-background-weak
        3xl:w-72
        border-r 
        border-border 
        flex 
        flex-col 
        h-screen
        transition-transform`}
        id="chat-sidebar"
      >
        <SidebarContent />
      </div>
    );
  };

  return (
    <>
      {popup}
      {!combinedSettings.isMobile && <DesktopSideBar />}

      <div
        className={`
          fixed top-0 left-0 z-40
          w-64 3xl:w-72
          h-screen
          bg-background-weak
          border-r border-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${combinedSettings.isMobile ? (isChatSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          ${combinedSettings.isMobile ? "shadow-lg" : ""}
        `}
        id="chat-sidebar"
      >
        <SidebarContent toggle />
      </div>
    </>
  );
};
