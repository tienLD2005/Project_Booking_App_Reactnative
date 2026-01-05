import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#5B6CFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Điều khoản & Điều kiện</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updateDate}>Cập nhật lần cuối: 10/11/2024</Text>

        <Text style={styles.paragraph}>
          Vui lòng đọc kỹ các điều khoản dịch vụ trước khi sử dụng ứng dụng đặt phòng khách sạn của chúng tôi.
        </Text>

        <Text style={styles.sectionTitle}>1. Điều kiện sử dụng</Text>

        <Text style={styles.paragraph}>
          Bằng việc sử dụng ứng dụng đặt phòng khách sạn này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.
          Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.
        </Text>

        <Text style={styles.sectionTitle}>2. Đăng ký tài khoản</Text>

        <Text style={styles.paragraph}>
          Để sử dụng dịch vụ đặt phòng, bạn cần đăng ký tài khoản bằng cách cung cấp thông tin chính xác và đầy đủ.
          Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động được thực hiện thông qua
          tài khoản của bạn sẽ được coi là do chính bạn thực hiện.
        </Text>

        <Text style={styles.sectionTitle}>3. Đặt phòng và thanh toán</Text>

        <Text style={styles.paragraph}>
          Khi đặt phòng, bạn cần cung cấp thông tin chính xác về ngày nhận phòng, ngày trả phòng và số lượng khách.
          Giá phòng có thể thay đổi tùy theo thời điểm và điều kiện. Bạn có thể thanh toán bằng tiền mặt, chuyển khoản ngân hàng,
          hoặc thẻ tín dụng. Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận đặt phòng.
        </Text>

        <Text style={styles.sectionTitle}>4. Hủy đặt phòng</Text>

        <Text style={styles.paragraph}>
          Bạn có thể hủy đặt phòng trước ngày nhận phòng. Chính sách hoàn tiền sẽ được áp dụng theo quy định của từng khách sạn.
          Vui lòng liên hệ với chúng tôi hoặc khách sạn để được hỗ trợ hủy đặt phòng.
        </Text>

        <Text style={styles.sectionTitle}>5. Trách nhiệm</Text>

        <Text style={styles.paragraph}>
          Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ đặt phòng, bao gồm nhưng không
          giới hạn: mất mát dữ liệu, gián đoạn dịch vụ, hoặc các vấn đề liên quan đến khách sạn. Bạn chịu trách nhiệm đảm bảo
          thông tin cung cấp là chính xác và đầy đủ.
        </Text>

        <Text style={styles.sectionTitle}>6. Quyền sở hữu trí tuệ</Text>

        <Text style={styles.paragraph}>
          Tất cả nội dung, thiết kế, logo, và tài liệu trong ứng dụng này đều thuộc quyền sở hữu của chúng tôi.
          Bạn không được sao chép, phân phối, hoặc sử dụng bất kỳ nội dung nào mà không có sự cho phép bằng văn bản của chúng tôi.
        </Text>

        <Text style={styles.sectionTitle}>7. Thay đổi điều khoản</Text>

        <Text style={styles.paragraph}>
          Chúng tôi có quyền thay đổi các điều khoản và điều kiện này vào bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay sau khi
          được công bố trên ứng dụng. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận các điều khoản mới.
        </Text>

        <Text style={styles.sectionTitle}>8. Liên hệ</Text>

        <Text style={styles.paragraph}>
          Nếu bạn có bất kỳ câu hỏi nào về các điều khoản và điều kiện này, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại
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
  sectionTitle: { fontSize: 18, color: "#5B6CFF", fontWeight: "600", marginTop: 8, marginBottom: 12 },
});

