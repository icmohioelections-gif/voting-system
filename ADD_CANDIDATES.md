# How to Add Candidates

There are two ways to add candidates to the voting system:

## 🎯 Method 1: Via Admin Dashboard (Recommended)

1. **Go to Admin Dashboard**
   - Visit: https://voting-system-five-rouge.vercel.app/admin
   - Or locally: http://localhost:3000/admin

2. **Click on "Candidates" Tab**

3. **Fill in the Form**
   - Enter candidate name (e.g., "Alice Johnson")
   - Enter position (e.g., "President", "Vice President")
   - Click "Add Candidate"

4. **Repeat** for all candidates you want to add

## 📝 Method 2: Via Supabase SQL Editor

If you prefer SQL or need to add multiple candidates at once:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj/editor

2. **Run this SQL:**
```sql
INSERT INTO candidates (name, position) VALUES
('Alice Johnson', 'President'),
('Bob Smith', 'President'),
('Carol Williams', 'Vice President'),
('David Brown', 'Vice President');
```

3. **Customize** the names and positions as needed

## ✅ Quick Test Setup

To quickly test the system, add at least 2 candidates:

**Via Admin Dashboard:**
- Candidate 1: Name: "Test Candidate 1", Position: "President"
- Candidate 2: Name: "Test Candidate 2", Position: "President"

**Via SQL:**
```sql
INSERT INTO candidates (name, position) VALUES
('Test Candidate 1', 'President'),
('Test Candidate 2', 'President');
```

## 📋 Notes

- Each candidate needs a **name** and **position**
- Multiple candidates can have the same position (e.g., multiple candidates for "President")
- Candidates are displayed on the vote page for voters to choose from
- You can add candidates at any time, even after voting has started

