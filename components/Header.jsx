import Feather from "@expo/vector-icons/Feather";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { getLocalStorage } from "../service/Storage";

export default function Header() {
  const [user, setUser] = useState();

  useEffect(() => {
    GetUserDetails();
  }, []);

  const GetUserDetails = async () => {
    const userInfo = await getLocalStorage("userDetail");
    console.log(userInfo);
    setUser(userInfo);
  };

  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 25,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Image
          source={require("./../assets/images/smiley.png")}
          style={{
            width: 40,
            height: 40,
            marginRight: 10,
            marginTop: 5,
          }}
        />

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#333",
              flexWrap: "wrap",
            }}
          >
            Greetings! {"\n"}
            {user?.displayName} 👋
          </Text>
        </View>

        <Feather
          name="settings"
          size={24}
          color="#8f8f8f"
          style={{ marginLeft: 10, marginTop: 15 }}
        />
      </View>
    </View>
  );
}
