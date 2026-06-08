// backend/utils/timeUtils.js
const parseTime = (timeInput) => {
    if (timeInput === undefined || timeInput === null) return 0;

    if (typeof timeInput === 'number') {
        return timeInput * 60;
    }

    const timeStr = String(timeInput);

    if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
    }

    const hours = parseInt(timeStr, 10);
    return isNaN(hours) ? 0 : hours * 60;
};

const checkTimeOverlap = (start1, end1, start2, end2) => {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    return s2 < e1 && e2 > s1;
};

module.exports = {
    parseTime,
    checkTimeOverlap
};
