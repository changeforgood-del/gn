# ArcGIS integration — Valley Reentry Housing Navigator

The ArcGIS workspace is `arcgis-map.html`.

## What is already integrated

- Reads the active client from the main navigator's browser storage.
- Centers ArcGIS on the client's preferred San Joaquin Valley city.
- Displays a separate client-preferred-area layer.
- Adds and stores housing opportunities with Best Match, Possible Match, Applied, Waitlist, or Denied status.
- Displays housing opportunity popups and pipeline counts.
- Includes ArcGIS Search, Zoom, Legend, navigation basemap, and OAuth-ready sign-in.
- Keeps client information out of the GitHub repository.

## Connect your ArcGIS Online account

ArcGIS user authentication requires an OAuth application/client ID. Register the deployed housing navigator URL as an OAuth redirect URL in ArcGIS Online, then place only the public App ID in the app configuration. Do not store an ArcGIS password, client secret, or long-lived access token in GitHub.

The current workspace has `CONFIG.appId` intentionally blank until an ArcGIS OAuth application ID is provided.

## Recommended ArcGIS Online layers

Create hosted FeatureLayers for:

1. `Housing_Inventory`
   - Property/program name
   - Address / point geometry
   - City / county
   - Unit type / bedrooms
   - Rent
   - Deposit
   - Voucher accepted
   - Reentry-friendly screening status
   - Accessibility
   - Pets/service animals
   - Availability status
   - Last verified date
   - Contact method
   - Application URL

2. `Housing_Applications`
   - Use a non-identifying client/case ID
   - Property ID
   - Applied date
   - Status
   - Follow-up date
   - Denial reason category
   - Next action

3. `Reentry_Resources`
   - STOP / Returning Home Well
   - County probation/reentry services
   - Transitional housing
   - Shelters
   - SSVF / veteran housing
   - Benefits / document replacement
   - Transportation resources

4. `Landlord_Partners`
   - Landlord/property-management organization
   - Service area
   - Screening notes
   - Voucher acceptance
   - Reentry experience
   - Last contact / follow-up

## Privacy design

Do not publish names, DOBs, corrections identifiers, SSNs, detailed conviction narratives, medical information, or other sensitive case data to a public ArcGIS layer. Use authenticated organization/group layers and non-identifying case IDs for shared housing workflow layers.
