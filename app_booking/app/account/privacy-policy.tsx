import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3182CE" />
        </TouchableOpacity>
        <Text style={styles.title}>Chính sách bảo mật</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updateDate}>Cập nhật lần cuối: 10/11/2024</Text>
        
        <Text style={styles.paragraph}>
          Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Vui lòng đọc kỹ chính sách bảo mật này để hiểu cách 
          chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
        </Text>

        <Text style={styles.sectionTitle}>1. Thông tin chúng tôi thu thập</Text>

        <Text style={styles.paragraph}>
          Chúng tôi thu thập các thông tin sau khi bạn sử dụng dịch vụ đặt phòng: tên, email, số điện thoại, ngày sinh, giới tính, 
          và thông tin thanh toán. Chúng tôi cũng có thể thu thập thông tin về thiết bị của bạn, địa chỉ IP, và dữ liệu sử dụng ứng dụng.
        </Text>

        <Text style={styles.sectionTitle}>2. Cách chúng tôi sử dụng thông tin</Text>

        <Text style={styles.paragraph}>
          Chúng tôi sử dụng thông tin của bạn để: xử lý đặt phòng, gửi email xác nhận, cải thiện dịch vụ, gửi thông báo về đơn đặt phòng, 
          và liên lạc với bạn khi cần thiết. Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba mà không có sự đồng ý của bạn.
        </Text>

        <Text style={styles.sectionTitle}>3. Bảo mật thông tin</Text>

        <Text style={styles.paragraph}>
          Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin cá nhân của bạn, bao gồm mã hóa dữ liệu, firewall, 
          và kiểm soát truy cập nghiêm ngặt. Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ dữ liệu nào là hoàn toàn an toàn 100%.
        </Text>

        <Text style={styles.sectionTitle}>4. Chia sẻ thông tin</Text>

        <Text style={styles.paragraph}>
          Chúng tôi có thể chia sẻ thông tin của bạn với khách sạn mà bạn đặt phòng để xử lý đặt phòng. Chúng tôi cũng có thể chia sẻ 
          thông tin khi được yêu cầu bởi pháp luật hoặc để bảo vệ quyền và tài sản của chúng tôi.
        </Text>

        <Text style={styles.sectionTitle}>5. Quyền của bạn</Text>

        <Text style={styles.paragraph}>
          Bạn có quyền truy cập, chỉnh sửa, hoặc xóa thông tin cá nhân của mình bất cứ lúc nào thông qua ứng dụng hoặc liên hệ với chúng tôi. 
          Bạn cũng có quyền từ chối nhận email marketing hoặc thông báo quảng cáo.
        </Text>

        <Text style={styles.sectionTitle}>6. Cookie và công nghệ theo dõi</Text>

        <Text style={styles.paragraph}>
          Chúng tôi sử dụng cookie và các công nghệ theo dõi tương tự để cải thiện trải nghiệm người dùng, phân tích cách sử dụng ứng dụng, 
          và cá nhân hóa nội dung. Bạn có thể quản lý cài đặt cookie trong trình duyệt của mình.
        </Text>

        <Text style={styles.sectionTitle}>7. Thay đổi chính sách</Text>

        <Text style={styles.paragraph}>
          Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Các thay đổi sẽ được thông báo trên ứng dụng và có hiệu lực 
          ngay sau khi được công bố. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận chính sách mới.
        </Text>

        <Text style={styles.sectionTitle}>8. Liên hệ</Text>

        <Text style={styles.paragraph}>
          Nếu bạn có bất kỳ câu hỏi hoặc lo ngại nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại 
          hỗ trợ khách hàng được cung cấp trong ứng dụng.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#2D3748" },
  content: { padding: 20 },
  updateDate: { fontSize: 14, color: "#718096", marginBottom: 16 },
  paragraph: { fontSize: 16, color: "#4A5568", lineHeight: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, color: "#3182CE", fontWeight: "600", marginTop: 8, marginBottom: 12 },
});

