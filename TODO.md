# Fix Camera AbortError in useCamera.ts

## Tasks
- [x] Add isStarting state to prevent concurrent startStream calls
- [x] Modify stopStream to set videoRef.current.srcObject = null
- [x] Update startStream to clear srcObject before assigning new stream
- [x] Handle AbortError specifically in catch block (don't set error)
- [x] Update renderLoop to better handle srcObject changes
- [ ] Test camera functionality after changes
