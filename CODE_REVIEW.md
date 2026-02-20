# Database Schema and RLS Policy Security Review

## Executive Summary
This report analyzes the Supabase database schema and Row Level Security (RLS) policies for the Briefed agency platform. The review identified **3 critical security vulnerabilities**, **4 warning-level issues**, and **5 improvement suggestions**.

---

## 🔴 Critical Issues

### SEC-1: Missing Storage RLS Policies for Project Assets
**File**: `supabase/migrations/003_storage_buckets.sql:6`  
**Issue**: The `project-assets` storage bucket lacks RLS policies, allowing unauthorized access to uploaded client files.  
**Risk**: Any authenticated user can access/modify project assets from any project.  
**Fix**:
```sql
-- Add to a new migration file
CREATE POLICY "Project members can view assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-assets' AND
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.assets a ON a.project_id = p.id
      WHERE a.storage_path = name
      AND (p.client_id = auth.uid() OR p.designer_id = auth.uid())
    )
  );

CREATE POLICY "Clients can upload to their projects" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-assets' AND
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (string_to_array(name, '/'))[1]
      AND p.client_id = auth.uid()
    )
  );
```

### SEC-2: API Routes Bypass RLS Without Proper Authorization  
**File**: `src/app/api/projects/[projectId]/responses/route.ts:65`  
**Issue**: GET endpoint uses admin client with no authorization check, exposing all project responses.  
**Risk**: Anyone with a project ID can access sensitive questionnaire responses.  
**Fix**:
```typescript
export async function GET(request: NextRequest, context: ResponseRouteContext) {
  try {
    const { projectId } = await context.params;
    
    // Validate magic token OR authenticated user
    const magicToken = request.headers.get("x-magic-token");
    const supabase = createAdminClient();
    
    if (magicToken) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("magic_link_token", magicToken)
        .single();
      
      if (!project) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      // TODO: Add proper session validation for authenticated users
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // ... rest of the function
  }
}
```

### SEC-3: Incomplete Authentication in Response API
**File**: `src/app/api/projects/[projectId]/responses/route.ts:30`  
**Issue**: TODO comment indicates missing authentication check for logged-in users.  
**Risk**: Authenticated users could potentially modify responses for projects they don't own.  
**Fix**:
```typescript
// After magic token validation, add:
else {
  // Validate authenticated user has access to this project
  const { data: { user } } = await createServerClient().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .or(`designer_id.eq.${user.id},client_id.eq.${user.id}`)
    .single();
    
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}
```

---

## 🟡 Warning Issues

### SEC-4: Missing Foreign Key Constraints  
**File**: `supabase/migrations/001_initial_schema.sql:52`  
**Issue**: `projects.template_id` allows NULL but doesn't verify template belongs to designer.  
**Risk**: Designer could reference another designer's template.  
**Fix**:
```sql
-- Add constraint to verify template ownership
ALTER TABLE public.projects 
ADD CONSTRAINT check_template_ownership 
CHECK (
  template_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.templates t 
    WHERE t.id = template_id AND t.designer_id = designer_id
  )
);
```

### SEC-5: Overly Broad Magic Token Access
**File**: `supabase/migrations/001_initial_schema.sql:62`  
**Issue**: Magic link tokens in projects table lack expiration or usage tracking.  
**Risk**: Links remain valid indefinitely; no audit trail.  
**Suggestion**:
```sql
ALTER TABLE public.projects 
ADD COLUMN magic_token_expires_at TIMESTAMPTZ,
ADD COLUMN magic_token_used_count INT DEFAULT 0;
```

### SEC-6: Missing Cascade Constraints
**File**: `supabase/migrations/004_notifications.sql:4`  
**Issue**: `notifications.user_id` references `profiles` but should handle client notifications too.  
**Risk**: Client notifications cannot be created; broken functionality.  
**Fix**:
```sql
-- Create a view that unions both profile types
CREATE VIEW public.all_users AS
  SELECT id, 'designer' as user_type FROM public.profiles
  UNION ALL
  SELECT id, 'client' as user_type FROM public.client_profiles;
```

### SEC-7: Insufficient Input Validation
**File**: `supabase/migrations/001_initial_schema.sql:26`  
**Issue**: `questions` JSONB field lacks schema validation.  
**Risk**: Malformed questionnaire data could break the application.  
**Suggestion**: Add JSON schema validation or application-level validation.

---

## 🟢 Suggestions

### SUG-1: Add Audit Trail Tables
Create audit tables to track sensitive operations (project creation, brief access, etc.).

### SUG-2: Implement Rate Limiting
Add rate limiting to API endpoints to prevent abuse.

### SUG-3: Enhanced Password Policies
Configure Supabase auth with stronger password requirements.

### SUG-4: Data Retention Policies
Implement automatic cleanup of old projects and associated data.

### SUG-5: Monitoring and Alerting
Set up monitoring for failed authentication attempts and suspicious activities.

---

## Database Relationships Validation

### Foreign Key Integrity ✅
All foreign key relationships are properly defined:
- `profiles.id` → `auth.users.id`
- `client_profiles.id` → `auth.users.id`  
- `templates.designer_id` → `profiles.id`
- `projects.designer_id` → `profiles.id`
- `projects.client_id` → `client_profiles.id`
- `projects.template_id` → `templates.id`
- `responses.project_id` → `projects.id`
- `assets.project_id` → `projects.id`
- `briefs.project_id` → `projects.id`

### Missing Indexes ⚠️
Consider adding indexes for:
- `projects(magic_link_token)` - for magic link lookups
- `responses(project_id, step_key)` - already has unique constraint
- `assets(project_id)` - for project asset queries

---

## Summary
- **Critical Issues**: 3 requiring immediate attention
- **Warning Issues**: 4 that should be addressed soon  
- **Suggestions**: 5 long-term improvements
- **Database Integrity**: Generally good with foreign key constraints
- **RLS Coverage**: Most tables have proper policies after migration 008

**Next Steps**: Address critical issues immediately, then implement warning-level fixes in the next release cycle.