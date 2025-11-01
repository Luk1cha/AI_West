import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { dbForum } from "../services/firebaseforum";

type CommentType = {
  id: string;
  author: string;
  text: string;
  timestamp?: any;
};

type PostType = {
  id: string;
  title: string;
  author: string;
  content: string;
  timestamp?: any;
  commentCount: number;
  comments?: CommentType[];
};

export default function Forum() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  
  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newContent, setNewContent] = useState("");
  
  // Comment form
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // Load posts
  useEffect(() => {
    const q = query(
      collection(dbForum, "posts"), 
      orderBy("timestamp", "desc")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as PostType))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error loading posts:", error);
        Alert.alert("Error", `Failed to load posts: ${error.message}`);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Load comments for selected post
  useEffect(() => {
    if (!selectedPost) return;

    const q = query(
      collection(dbForum, "posts", selectedPost.id, "comments"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSelectedPost({
        ...selectedPost,
        comments: snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CommentType)),
      });
    });

    return () => unsubscribe();
  }, [selectedPost?.id]);

  // Create new post
  const createPost = async () => {
    if (!newTitle.trim() || !newAuthor.trim() || !newContent.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(dbForum, "posts"), {
        title: newTitle.trim(),
        author: newAuthor.trim(),
        content: newContent.trim(),
        timestamp: serverTimestamp(),
        commentCount: 0,
      });
      
      setNewTitle("");
      setNewAuthor("");
      setNewContent("");
      setModalVisible(false);
      Alert.alert("Success ✅", "Post created!");
    } catch (error: any) {
      Alert.alert("Error", `Failed to create post: ${error.message}`);
    }
  };

  // Add comment
  const addComment = async () => {
    if (!selectedPost || !commentAuthor.trim() || !commentText.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    try {
      // Add comment to subcollection
      await addDoc(
        collection(dbForum, "posts", selectedPost.id, "comments"),
        {
          author: commentAuthor.trim(),
          text: commentText.trim(),
          timestamp: serverTimestamp(),
        }
      );

      // Increment comment count
      await updateDoc(doc(dbForum, "posts", selectedPost.id), {
        commentCount: increment(1),
      });

      setCommentText("");
      Alert.alert("Success ✅", "Comment added!");
    } catch (error: any) {
      Alert.alert("Error", `Failed to add comment: ${error.message}`);
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(dbForum, "posts", postId));
              Alert.alert("Deleted ✅", "Post deleted");
            } catch (error: any) {
              Alert.alert("Error", `Failed to delete: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  // Open post details
  const openPost = (post: PostType) => {
    setSelectedPost(post);
    setPostModalVisible(true);
  };

  // Render post item
  const renderPost = ({ item }: { item: PostType }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => openPost(item)}
      onLongPress={() => deletePost(item.id)}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.commentBadge}>
          💬 {item.commentCount || 0}
        </Text>
      </View>
      <Text style={styles.postAuthor}>by {item.author}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={styles.postTime}>
        {item.timestamp?.toDate?.()?.toLocaleString() || "Just now"}
      </Text>
    </TouchableOpacity>
  );

  // Render comment
  const renderComment = ({ item }: { item: CommentType }) => (
    <View style={styles.commentCard}>
      <Text style={styles.commentAuthor}>{item.author}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
      <Text style={styles.commentTime}>
        {item.timestamp?.toDate?.()?.toLocaleString() || "Just now"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00c853" />
        <Text style={styles.loadingText}>Loading forum...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>💬 Discussion Forum</Text>
            <Text style={styles.headerSubtitle}>
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.newPostButtonText}>+ New Post</Text>
          </TouchableOpacity>
        </View>

        {/* Posts List */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to start a discussion! 🚀
              </Text>
            </View>
          }
        />

        {/* New Post Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={newAuthor}
              onChangeText={setNewAuthor}
            />

            <TextInput
              style={styles.input}
              placeholder="Post title"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity style={styles.submitButton} onPress={createPost}>
              <Text style={styles.submitButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Post Detail Modal */}
        <Modal
          visible={postModalVisible}
          animationType="slide"
          onRequestClose={() => setPostModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Discussion</Text>
              <TouchableOpacity
                onPress={() => setPostModalVisible(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <>
                <View style={styles.postDetail}>
                  <Text style={styles.postDetailTitle}>
                    {selectedPost.title}
                  </Text>
                  <Text style={styles.postDetailAuthor}>
                    by {selectedPost.author}
                  </Text>
                  <Text style={styles.postDetailContent}>
                    {selectedPost.content}
                  </Text>
                </View>

                <Text style={styles.commentsHeader}>
                  💬 Comments ({selectedPost.comments?.length || 0})
                </Text>

                <FlatList
                  data={selectedPost.comments || []}
                  keyExtractor={(item) => item.id}
                  renderItem={renderComment}
                  style={styles.commentsList}
                  ListEmptyComponent={
                    <Text style={styles.noComments}>
                      No comments yet. Be the first!
                    </Text>
                  }
                />

                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Your name"
                    value={commentAuthor}
                    onChangeText={setCommentAuthor}
                  />
                  <TextInput
                    style={[styles.commentInput, styles.commentTextInput]}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.commentButton}
                    onPress={addComment}
                  >
                    <Text style={styles.commentButtonText}>Comment</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  newPostButton: {
    backgroundColor: "#00c853",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newPostButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 10,
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  commentBadge: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  postAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  postTime: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    fontSize: 28,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#00c853",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  postDetail: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  postDetailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  postDetailAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  postDetailContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 16,
    paddingBottom: 8,
  },
  commentsList: {
    flex: 1,
  },
  commentCard: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
  },
  noComments: {
    textAlign: "center",
    color: "#999",
    padding: 20,
    fontStyle: "italic",
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 16,
    backgroundColor: "#fff",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  commentTextInput: {
    height: 80,
    textAlignVertical: "top",
  },
  commentButton: {
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  commentButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});