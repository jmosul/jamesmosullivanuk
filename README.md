# James O’Sullivan

A React 19 and TypeScript site built with Vite.

```sh
nvm install
npm ci
npm run dev
```

Run `npm run lint` for Oxlint, `npm test` for Vitest, and `npm run build` for TypeScript checks and the production bundle. Run `npm run preview` to serve the production build locally.

## Deploy the website and shared user pool

Amplify Hosting serves the static Vite build from `dist/`. On the default
Amazon Linux 2023 build image, `amplify.yml` ensures `libatomic` is installed
and selects the Node.js version pinned in `.nvmrc`. The Hosting build deploys
the Amplify Gen 2 backend on `main` using the Hosting-provided `AWS_BRANCH`
and `AWS_APP_ID`. The home page stays public and can be built locally without
AWS credentials or `amplify_outputs.json`.

1. Choose the AWS account and Region that will own the production directory.
   Confirm that the account and Region are [bootstrapped for CDK](https://docs.amplify.aws/react/build-a-backend/troubleshooting/cdktoolkit-stack/)
   (`CDKToolkit` stack). Complete bootstrapping with an authorized operator
   if needed.
2. Once these changes are on `main`, open the [AWS Amplify console](https://console.aws.amazon.com/amplify/home)
   in that Region. For a new connection, select **All apps** → **New app** → **Host web app**.
3. Choose **GitHub** and **Continue**. If prompted, authorize and install the
   Amplify GitHub App. Choose **Only select repositories**, select
   `jmosul/jamesmosullivanuk`, and select **Install & Authorize**. If the app
   is already installed, make sure it has access to this repository.
4. On **Add repository branch**, choose `jmosul/jamesmosullivanuk` and `main`,
   then select **Next**. The Vite app and build specification are at the
   repository root.
5. On **Configure build settings**, leave the default Amazon Linux 2023 image
   and confirm Amplify uses the repository's `amplify.yml`. Select or create
   the [Amplify backend deployment service role](https://docs.amplify.aws/react/reference/iam-policy/)
   with the `AmplifyBackendDeployFullAccess` managed policy, then save and deploy.

For an existing Hosting app, keep its `main` connection, update **App
settings** → **IAM roles** → **Service role** if needed, and deploy `main`.

[AWS guide to connecting a GitHub repository](https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html)

### Verify the production deployment

Confirm the `main` build log shows a successful `ampx pipeline-deploy` and
open `/` at the Amplify Hosting URL while signed out. With AWS credentials
that can read the deployment, set `AMPLIFY_APP_ID` to the Hosting app ID
and retrieve the production outputs.

```sh
npx ampx generate outputs --branch main --app-id "$AMPLIFY_APP_ID"
```

Use `custom.shared_user_pool_id` and `custom.shared_user_pool_region` from
`amplify_outputs.json` for `POOL_ID` and `POOL_REGION`.

```sh
aws cognito-idp describe-user-pool --region "$POOL_REGION" --user-pool-id "$POOL_ID" \
  --query 'UserPool.{AdminOnly:AdminCreateUserConfig.AllowAdminCreateUserOnly,SignIn:UsernameAttributes,DeletionProtection:DeletionProtection}'
```

Expect `AdminOnly: true`, `SignIn: ["email"]`, and `DeletionProtection: "ACTIVE"`.
In CloudFormation, verify the pool in the main deployment's nested stack has
both `DeletionPolicy: Retain` and `UpdateReplacePolicy: Retain`. CloudFormation
keeps the directory on stack removal or replacement, and Cognito blocks
direct deletion while protection is active. Keep the same production pool
ID across deployments.

### Invite a user

1. With admin access to the production pool, open **Amazon Cognito** →
   **User pools** → the production pool → **Users** → **Create user**.
2. Enter the invitee's email address, select email delivery, and let Cognito
   generate a temporary password. Cognito sends the invitation and sets the
   user's status to `FORCE_CHANGE_PASSWORD`.
3. Share the consuming app's sign-in URL with the invitee. They sign in with
   their email and temporary password, then set a permanent password when
   Cognito returns `NEW_PASSWORD_REQUIRED`.
4. If the temporary password expires, use **Resend invitation** for that user
   to issue a new one. Mark an email verified only when you have independently
   verified ownership, or have the user verify it through the consuming app.
   Email-based password recovery requires a verified email.

When the first consumer app is connected, test an administrator invite through
to the password change and confirm that self-service sign-up through the app
client is rejected. Cognito uses its default email delivery for invites.

[AWS guide to creating users as an administrator](https://docs.aws.amazon.com/cognito/latest/developerguide/how-to-create-user-accounts.html)

### Grant James membership in `SuperAdmins`

Deploy `main` to create the `SuperAdmins` group in the production pool. With
admin access to that pool, use the invitation steps above to create James's
account if needed. Open his user record in Cognito, verify it is his account,
and copy its Cognito username. Set `JAMES_COGNITO_USERNAME` to that username
and use the production `POOL_ID` and `POOL_REGION` from the deployment outputs.

```sh
aws cognito-idp admin-add-user-to-group --region "$POOL_REGION" --user-pool-id "$POOL_ID" \
  --username "$JAMES_COGNITO_USERNAME" --group-name SuperAdmins

aws cognito-idp list-users-in-group --region "$POOL_REGION" --user-pool-id "$POOL_ID" \
  --group-name SuperAdmins --query 'Users[].Username'
```

Confirm James is the only member. Once a consuming app is connected, James can
sign out and back in to get fresh tokens. Cognito includes `SuperAdmins` in the
`cognito:groups` claim of newly issued ID and access tokens.

The group has no IAM role and grants no AWS permissions. Apps can opt in by
checking for `SuperAdmins` server-side in a validated Cognito token on specific
admin actions. Existing resource ownership rules continue to apply.

[AWS guide to Cognito user pool groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)

### Connect a future app

Use the production pool ID and Region from the `main` outputs. Provision a
dedicated Cognito user pool app client for each app. For a browser app, use a
public client without a client secret and handle the first-sign-in password
change in the app. Apps that need uploads can provision their own Cognito
identity pool, register the shared user pool with their app client, and assign
their own IAM roles scoped to their upload resources. This backend provisions
the user directory only. Syma continues to use its existing pool.

[Amplify guide to using existing Cognito resources](https://docs.amplify.aws/react/build-a-backend/auth/use-existing-cognito-resources/)
