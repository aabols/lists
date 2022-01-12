export default function setRepeatingTask(task, delay) {
    task();
    const interval = setInterval(task, delay);
    return () => {
        clearInterval(interval);
    }
}