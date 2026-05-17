export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... similar auth and ownership check, then prisma.occupant.delete
}