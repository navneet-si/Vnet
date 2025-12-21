import { useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import FeedPost from "../components/FeedPost";

export default function FeedPage() {
  const { setActivePost, handleScroll } = useOutletContext();
  const observer = useRef(null);
  const scrollContainerRef = useRef(null);
  const lastScrollY = useRef(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const viewedPosts = useRef(new Set()); // Track viewed posts to avoid duplicate API calls

  // Local scroll handler
  const onScroll = (e) => {
    const currentScrollY = e.target.scrollTop;

    // Call parent handler if it exists
    if (handleScroll) {
      handleScroll(e);
    }

    lastScrollY.current = currentScrollY;
  };

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
        if (data.length > 0) {
          setActivePost(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle like
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/protected/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, likesCount: data.likesCount, isLiked: data.isLiked }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/protected/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Handle comment
  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/protected/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: commentText }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setCommentText("");
        fetchComments(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  // Open comment modal
  const openCommentModal = (postId) => {
    setShowCommentModal(postId);
    if (!comments[postId]) {
      fetchComments(postId);
    }
  };

  // Record post view
  const recordView = async (postId) => {
    if (viewedPosts.current.has(postId)) return; // Already viewed in this session
    viewedPosts.current.add(postId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/protected/posts/${postId}/view`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, viewsCount: data.viewsCount }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  useEffect(() => {
    if (posts.length > 0) {
      setActivePost(posts[0]);
      // Record view for first post
      recordView(posts[0]._id);

      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.dataset.id;
              const currentPost = posts.find((p) => p._id === id);
              if (currentPost) {
                setActivePost(currentPost);
                // Record view when post becomes visible
                recordView(id);
              }
            }
          });
        },
        { threshold: 0.6 }
      );

      const postElements = document.querySelectorAll(".post-wrapper");
      postElements.forEach((el) => observer.current.observe(el));

      return () => {
        if (observer.current) observer.current.disconnect();
      };
    }
  }, [posts, setActivePost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading posts...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        No posts yet. Be the first to post!
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {posts.map((post) => {
          const mediaType = post.videoUrl
            ? "video"
            : post.imageUrl
            ? "image"
            : "none";
          const mediaSrc = post.videoUrl || post.imageUrl || "";

          return (
            <div
              key={post._id}
              data-id={post._id}
              className="post-wrapper h-screen w-full snap-start snap-always relative border-b border-white/5 bg-black"
            >
              {mediaType !== "none" ? (
                <FeedPost mediaType={mediaType} mediaSrc={mediaSrc} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#161616] p-8 overflow-y-auto">
                  <div className="max-w-2xl text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                        {post.userId?.username?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {post.userId?.username || "User"}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {post.userId?.role || "Member"}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg leading-relaxed mb-4">
                      {post.content}
                    </p>
                    {post.fileUrl && (
                      <a
                        href={post.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        📎 Download File
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* ACTION BAR - RIGHT SIDE */}
              <div className="absolute bottom-20 right-6 z-20 flex flex-col gap-4">
                {/* Like Button */}
                <div className="flex flex-col items-center gap-2 group">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 active:scale-90 ${
                      post.isLiked
                        ? "bg-red-500/20"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={post.isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-7 h-7 ${
                        post.isLiked
                          ? "text-red-500 fill-red-500"
                          : "text-white"
                      } group-hover:text-red-400 transition-colors`}
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.691 2.25 5.353 4.814 3.25 8.05 3.25c1.1 0 2.485.64 3.95 2.383 1.464-1.743 2.85-2.383 3.95-2.383 3.236 0 5.8 2.103 5.8 5.441 0 3.483-2.438 6.669-4.742 8.82a25.181 25.181 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {post.likesCount || 0}
                  </span>
                </div>

                {/* Comment Button */}
                <div className="flex flex-col items-center gap-2 group">
                  <button
                    onClick={() => openCommentModal(post._id)}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 active:scale-90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7 text-white group-hover:text-blue-400 transition-colors"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {post.commentsCount || 0}
                  </span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center gap-2 group">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: "Check out this post",
                            text: post.content,
                            url: window.location.href,
                          })
                          .catch((err) => console.log("Share failed:", err));
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 active:scale-90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7 text-white group-hover:text-green-400 transition-colors"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    Share
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCommentModal(null)}
        >
          <div
            className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Comments</h2>
              <button
                onClick={() => setShowCommentModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {comments[showCommentModal]?.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-[#0A0A0A] rounded-lg p-3 border border-[#2f2f31]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {comment.userId?.username?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {comment.userId?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{comment.text}</p>
                </div>
              ))}
              {(!comments[showCommentModal] ||
                comments[showCommentModal].length === 0) && (
                <p className="text-gray-400 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-[#161616] border border-[#2f2f31] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleComment(showCommentModal);
                  }
                }}
              />
              <button
                onClick={() => handleComment(showCommentModal)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
