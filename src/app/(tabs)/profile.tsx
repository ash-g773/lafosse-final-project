import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../themes";

interface UserProfile {
  profiles_id: number;
  users_id: number;
  full_name: string | null;
  phone: string | null;
  postcode: string | null;
  lat: string | null;
  lng: string | null;
  alert_radius: number;
  created_at: string;
}

interface Pet {
  pets_id: number;
  users_id: number;
  name: string;
  species: string;
  breed: string | null;
  colour: string | null;
  description: string | null;
  last_seen_location: string | null;
  lat: string; //look at backend fix so these can be number
  lng: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

interface Sighting {
  sightings_id: number;
  pets_id: number | null;
  users_id: number | null;
  guest_contact: string | null;
  sighting_description: string;
  location_description: string;
  lat: string;
  lng: string;
  image_url: string | null;
  created_at: string;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [userId, setUserId] = useState<number | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [alertRadius, setAlertRadius] = useState("");

  const hasChanges =
    fullName !== (profile?.full_name || "") ||
    phone !== (profile?.phone || "") ||
    postcode !== (profile?.postcode || "");

  function decodeUserId(token: string): number | null {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      // check with your backend team which field name they use
      return decoded.users_id || decoded.userId || decoded.id || decoded.sub;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    async function start() {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const id = decodeUserId(token);
        setUserId(id);
        if (id) {
          await fetchProfileWithId(id, token);
        }
      }
    }
    start();
  }, []);
  async function fetchProfileWithId(id: number, token: string) {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const json = await response.json();
      console.log("Profile data:", json);

      const data = json.data;

      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setPostcode(data.postcode || "");
      setAlertRadius(data.alert_radius?.toString() || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [lostPets, setLostPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [showPets, setShowPets] = useState(false);

  async function fetchLostPets() {
    if (!userId) return;
    setPetsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/${userId}/pets`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await response.json();
      const data = json.data;
      console.log("Lost pets data:", data);
      setLostPets(data);
    } catch (error) {
      console.error("Failed to fetch lost pets:", error);
    } finally {
      setPetsLoading(false);
    }
  }

  async function markAsReunited(petId: number) {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/pets/${petId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "reunited",
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      setLostPets((prev) =>
        prev.map((pet) =>
          pet.pets_id === petId ? { ...pet, status: "reunited" } : pet,
        ),
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !userId) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/profile/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName,
            phone: phone,
            postcode: postcode,
            alert_radius: parseInt(alertRadius),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccess(true);

      // clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Something went wrong, please try again");
    } finally {
      setSaving(false);
    }
  }

  const [aiMatches, setAiMatches] = useState<Record<number, any>>({});
  const [aiLoadingId, setAiLoadingId] = useState<number | null>(null);

  async function checkAiMatches(petId: number) {
    setAiLoadingId(petId);
    setAiMatches((prev: any) => ({ ...prev, [petId]: null }));
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/pets/${petId}/ai-matches`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      console.log("AI Matches Data:", data);

      setAiMatches((prev: any) => ({ ...prev, [petId]: data }));
      console.log(data);
    } catch (error) {
      console.error("AI match failed:", error);
    } finally {
      setAiLoadingId(null);
    }
  }

  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  if (profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: theme.colors.primary }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView style={styles.container}>
          <TouchableOpacity
            style={styles.backBtn}
            testID="back-btn"
            onPress={() => router.back()}
          >
            <Text>Back</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Your Profile</Text>
          {success && (
            <Text style={styles.successMsg}>Profile updated successfully!</Text>
          )}
          {error && <Text style={styles.errorMsg}>{error}</Text>}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            style={styles.input}
            onChangeText={setFullName}
            placeholder="Your Name"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Your Number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Postcode</Text>
          <TextInput
            value={postcode}
            style={styles.input}
            onChangeText={setPostcode}
            placeholder="Your Postcode"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Alert Radius (m)</Text>
          <TextInput
            value={alertRadius}
            style={styles.input}
            onChangeText={setAlertRadius}
            placeholder="Choose your alert radius"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            testID="save-btn"
            disabled={saving || !hasChanges}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <View style={styles.petsSection}>
            <TouchableOpacity
              style={styles.viewPetsBtn}
              onPress={() => {
                if (!showPets) {
                  fetchLostPets(); // fetch when opening
                }
                setShowPets(!showPets);
              }}
            >
              <Text style={styles.viewPetsBtnText}>
                {showPets
                  ? "Hide Lost Pet Reports ▲"
                  : "View Lost Pet Reports ▼"}
              </Text>
            </TouchableOpacity>

            {showPets && (
              <>
                {petsLoading && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginTop: theme.spacing.md }}
                  />
                )}

                {!petsLoading && lostPets.length === 0 && (
                  <Text style={styles.noPetsMsg}>
                    You have no previous lost pet reports.
                  </Text>
                )}

                {!petsLoading &&
                  lostPets.map((Pet) => (
                    <View key={Pet.pets_id} style={styles.petCard}>
                      {Pet.image_url && (
                        <Image
                          style={styles.petImage}
                          source={{ uri: Pet.image_url }}
                        />
                      )}
                      <Text style={styles.petName}>{Pet.name}</Text>
                      <Text style={styles.petDetail}>
                        {Pet.species}
                        {Pet.breed ? ` · ${Pet.breed}` : ""}
                      </Text>
                      {Pet.colour && (
                        <Text style={styles.petDetail}>
                          Colour: {Pet.colour}
                        </Text>
                      )}
                      {Pet.description && (
                        <Text style={styles.petDetail}>{Pet.description}</Text>
                      )}
                      {Pet.last_seen_location && (
                        <Text style={styles.petDetail}>
                          Last seen: {Pet.last_seen_location}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              Pet.status === "lost"
                                ? theme.colors.accent
                                : theme.colors.success,
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {Pet.status === "lost" ? "🔴 Missing" : "🟢 Reunited"}
                        </Text>
                      </View>
                      {Pet.status === "lost" && (
                        <TouchableOpacity
                          style={styles.reunitedBtn}
                          testID={`reunite-btn-${Pet.pets_id}`}
                          onPress={() => markAsReunited(Pet.pets_id)}
                        >
                          <Text style={styles.reunitedBtnText}>
                            🟢 Mark as Reunited
                          </Text>
                        </TouchableOpacity>
                      )}
                      {Pet.status === "lost" && (
                        <TouchableOpacity
                          style={styles.aiMatchBtn}
                          onPress={() => checkAiMatches(Pet.pets_id)}
                        >
                          <Text style={styles.aiMatchBtnText}>
                            Check for matches
                          </Text>
                        </TouchableOpacity>
                      )}
                      {aiLoadingId === Pet.pets_id && (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                        />
                      )}

                      {aiMatches[Pet.pets_id] && (
                        <View style={styles.aiResults}>
                          <Text style={styles.aiSummary}>
                            {aiMatches[Pet.pets_id].summary}
                          </Text>
                          {aiMatches[Pet.pets_id].matches?.map((match: any) => (
                            <TouchableOpacity
                              key={match.sighting_id}
                              onPress={() => {
                                if (match.sighting) {
                                  setSelectedSighting(match.sighting);
                                  setModalVisible(true);
                                } else {
                                  console.error(
                                    "No sighting data for match:",
                                    match,
                                  );
                                }
                              }}
                              style={[
                                styles.aiMatchCard,
                                {
                                  borderLeftColor:
                                    match.likelihood === "High"
                                      ? theme.colors.success
                                      : match.likelihood === "Medium"
                                        ? theme.colors.primary
                                        : theme.colors.text.secondary,
                                },
                              ]}
                            >
                              <Text style={styles.aiLikelihood}>
                                {match.likelihood === "High"
                                  ? "🟢"
                                  : match.likelihood === "Medium"
                                    ? "🟡"
                                    : "🔴"}{" "}
                                {match.likelihood} match
                              </Text>
                              <Text style={styles.aiReasoning}>
                                {match.reasoning}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
              </>
            )}
          </View>
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.modalCard}
                onPress={() => {}}
              >
                {/* handle bar */}
                <View style={styles.modalHandle} />

                <Text style={styles.modalTitle}>Possible Sighting</Text>

                {selectedSighting?.image_url && (
                  <Image
                    source={{ uri: selectedSighting.image_url }}
                    style={styles.image}
                  />
                )}

                {selectedSighting?.sighting_description && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Description</Text>
                    <Text style={styles.modalText}>
                      {selectedSighting.sighting_description}
                    </Text>
                  </View>
                )}

                {selectedSighting?.location_description && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>📍 Location</Text>
                    <Text style={styles.modalText}>
                      {selectedSighting.location_description}
                    </Text>
                  </View>
                )}

                {selectedSighting?.created_at && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>🕐 Reported</Text>
                    <Text style={styles.modalText}>
                      {new Date(selectedSighting.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </Text>
                  </View>
                )}

                {selectedSighting?.guest_contact && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>📞 Contact</Text>
                    <Text style={styles.modalText}>
                      {selectedSighting.guest_contact}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    gap: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 10,
  },
  heading: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
    padding: 10,
    alignSelf: "center",
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    padding: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
  successMsg: {
    color: theme.colors.success,
    fontSize: theme.fontSize.md,
    textAlign: "center",
    padding: theme.spacing.sm,
  },
  errorMsg: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    textAlign: "center",
    padding: theme.spacing.sm,
  },
  noPetsMsg: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  petDetail: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  petName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  petCard: {
    backgroundColor: theme.colors.secondary + "B3",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    gap: theme.spacing.xs,
  },
  petImage: { width: "100%", height: 150, borderRadius: theme.borderRadius.sm },
  viewPetsBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  viewPetsBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
  petsSection: {
    margin: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  reunitedBtn: {
    flex: 1,
    backgroundColor: theme.colors.success,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  reunitedBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.sm,
  },
  aiMatchBtn: {
    backgroundColor: theme.colors.tertiary || "#2D6A7F",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  aiMatchBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.sm,
  },
  aiResults: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  aiSummary: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontStyle: "italic",
    marginBottom: theme.spacing.xs,
  },
  aiMatchCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderLeftWidth: 4,
    gap: theme.spacing.xs,
  },
  aiLikelihood: {
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  aiReasoning: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 40,
    gap: theme.spacing.md,
    minHeight: "45%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.secondary,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  modalRow: {
    gap: 4,
  },
  modalLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  modalCloseBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  modalCloseBtnText: {
    color: theme.colors.text.light,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
  image: {
    height: 200,
    width: "100%",
    borderRadius: theme.borderRadius.md,
    resizeMode: "cover",
  },
});
