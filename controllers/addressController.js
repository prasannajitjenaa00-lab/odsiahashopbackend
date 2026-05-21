import { Address } from '../models/index.js';

// @desc    Add Address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
      isDefault
    } = req.body;

    // Check if this is the first address for the user; if so, force it to be default
    const count = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = count === 0 ? true : !!isDefault;

    // If setting as default, unset other default addresses
    if (shouldBeDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      userId: req.user._id,
      name,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternatePhone,
      addressType: addressType || 'home',
      isDefault: shouldBeDefault
    });

    res.status(201).json(newAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get User Addresses
// @route   GET /api/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update Address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
      isDefault
    } = req.body;

    const addressToUpdate = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If making this address default, unset others
    if (isDefault && !addressToUpdate.isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    addressToUpdate.name = name !== undefined ? name : addressToUpdate.name;
    addressToUpdate.phone = phone !== undefined ? phone : addressToUpdate.phone;
    addressToUpdate.pincode = pincode !== undefined ? pincode : addressToUpdate.pincode;
    addressToUpdate.locality = locality !== undefined ? locality : addressToUpdate.locality;
    addressToUpdate.address = address !== undefined ? address : addressToUpdate.address;
    addressToUpdate.city = city !== undefined ? city : addressToUpdate.city;
    addressToUpdate.state = state !== undefined ? state : addressToUpdate.state;
    addressToUpdate.landmark = landmark !== undefined ? landmark : addressToUpdate.landmark;
    addressToUpdate.alternatePhone = alternatePhone !== undefined ? alternatePhone : addressToUpdate.alternatePhone;
    addressToUpdate.addressType = addressType !== undefined ? addressType : addressToUpdate.addressType;
    addressToUpdate.isDefault = isDefault !== undefined ? isDefault : addressToUpdate.isDefault;

    const updatedAddress = await addressToUpdate.save();
    res.json(updatedAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete Address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const addressToDelete = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!addressToDelete) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = addressToDelete.isDefault;
    await Address.deleteOne({ _id: req.params.id });

    // If the deleted address was default, make the next latest address default if one exists
    if (wasDefault) {
      const nextAddress = await Address.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Set Default Address
// @route   PUT /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const addressToSet = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!addressToSet) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other defaults
    await Address.updateMany({ userId: req.user._id }, { isDefault: false });

    addressToSet.isDefault = true;
    const updated = await addressToSet.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
