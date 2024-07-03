import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
// import Chat from "../../../../backend/models/chatModel";

// var cors = require("cors");
// const dotenv = require("dotenv");
// dotenv.config();
// // Enable CORS
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  // const [needChat, setNeededChat] = useState({});
  const [fetchedChats, setFetchedChats] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    Promise.all(notification.map((notif) => getChatById(notif.chat))).then(
      (chats) => {
        setFetchedChats(chats);
      }
    );
  }, [notification]);

  const getChatById = async (chatId) => {
    try {
      // setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        // `http://localhost:5000/api/chat?search=${chatId}`,
        `http://localhost:5000/api/chat/`,
        // `http://localhost:5000/api/chat?search=${chatId}&userId1=${user}`,
        config
      );

      const neededChat = data.find((chat) => chat._id === chatId);
      return neededChat;
    } catch (error) {
      toast({
        title: "Error fetching the chat by me",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // console.log(config);
      // console.log("susim");
      // console.log(search);
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${search}`,
        config
      );
      // console.log("gautam");
      // console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      console.error(
        "Search Error:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error Occured!",
        description: "Failed to load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"white"}
        w={"100%"}
        p={"5px 10px 5px 10px"}
        borderWidth={"5px"}
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant={"ghost"} onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={"4"}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize={"2xl"} fontFamily={"Work sans"}>
          Talk-A-Tive
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize={"2xl"} m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {/* {notification.map(
                (notif) => (
                  console.log(notif.chat),
                  // console.log(user),
                  console.log(getChatById(notif.chat)),
                  // getChatById(notif.chat),
                  console.log(needChat),
                  needChat == {}
                    ? console.log("empty")
                    : console.log("not empty"),
                  (
                    <MenuItem key={notif._id}>
                      {notif.chat.isGroupChat
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from ${getSender(
                            user,
                            getChatById(notif.chat.users)
                          )}`}
                    </MenuItem>
                  )
                )
              )} */}

              {/* {notification.map(async (notif) => {
                const chat = await getChatById(notif.chat);
                // needChat = chat;
                // setNeededChat(chat)
                console.log(chat);
                return (
                  <MenuItem key={notif._id}>
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, chat.users)}`}
                  </MenuItem>
                );
              })} */}

              {fetchedChats.map((chat, index) => {
                return (
                  // console.log(notification),
                  <MenuItem
                    key={notification[index].chat}
                    onClick={() => {
                      // console.log(chat);
                      // console.log(index);
                      setSelectedChat(chat);
                      // console.log(notification);
                      // console.log(chat._id);
                      notification.forEach((n) => {
                        // console.log(n.chat);
                      });
                      setFetchedChats(
                        fetchedChats.filter((n) => n.chat !== chat._id)
                      )
                      // if (notification && notification.length > 0) {
                        // setNotification(
                          // notification.filter((n) => n.chat !== chat._id);
                        // );
                      // }
                      // setNotification(
                      //   notification.filter((n) => n.chat !== chat._id),
                      // );
                      // setNotification(
                      //   notification.filter((n) => n._id !== chat._id)
                      // );
                      // notification.filter((n) => console.log(n.chat));
                    }}
                  >
                    {notification[index].chat.isGroupChat
                      ? `New Message in ${notification[index].chat.chatName}`
                      : `New Message from ${getSender(user, chat.users)}`}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
